#!/usr/bin/env node
import * as fs from "fs";
import * as path from "path";
function detectUrlType(url) {
  if (!url || typeof url !== "string") {
    return null;
  }
  const trimmedUrl = url.trim();
  if (/^https?:\/\/wordpress\.org\/plugins\/.+/.test(trimmedUrl)) {
    return "plugin";
  }
  if (/^https?:\/\/wordpress\.org\/themes\/.+/.test(trimmedUrl)) {
    return "theme";
  }
  if (/^https?:\/\/github\.com\/.+\/.+/.test(trimmedUrl)) {
    return "plugin";
  }
  if (/^https?:\/\/.+\.(zip|tar\.gz|tgz)(\?.*)?$/.test(trimmedUrl)) {
    return "plugin";
  }
  if (/^https?:\/\/.+/.test(trimmedUrl)) {
    return "plugin";
  }
  return null;
}
function detectWpAdminUrl(url) {
  if (!url || typeof url !== "string") {
    return null;
  }
  const trimmed = url.trim();
  if (trimmed.startsWith("/wp-admin/") || trimmed.startsWith("/wp-login.php")) {
    return trimmed;
  }
  try {
    const urlObj = new URL(trimmed);
    const path2 = urlObj.pathname + urlObj.search + urlObj.hash;
    if (path2.includes("/wp-admin/") || path2.includes("/wp-login.php")) {
      return path2;
    }
  } catch (e) {
    return null;
  }
  return null;
}
function detectHtml(text) {
  if (!text || typeof text !== "string") {
    return false;
  }
  const trimmed = text.trim();
  return /<[^>]+>/.test(trimmed) && trimmed.includes("</");
}
function detectPhp(text) {
  if (!text || typeof text !== "string") {
    return false;
  }
  const trimmed = text.trim();
  return trimmed.startsWith("<?php") || trimmed.includes("<?php") && trimmed.includes("?>");
}
function isPlaygroundDomain(hostname) {
  return hostname === "playground.wordpress.net" || hostname === "127.0.0.1";
}
function detectPlaygroundUrl(url, base64Decoder) {
  if (!url || typeof url !== "string") {
    return null;
  }
  const trimmed = url.trim();
  try {
    const urlObj = new URL(trimmed);
    if (isPlaygroundDomain(urlObj.hostname) && urlObj.hash && urlObj.hash.length > 1) {
      const hashContent = urlObj.hash.substring(1);
      if (hashContent.startsWith("%7B") || hashContent.startsWith("{")) {
        try {
          const decoded = decodeURIComponent(hashContent);
          return JSON.parse(decoded);
        } catch (e) {
        }
      }
      try {
        const decode = base64Decoder || ((s) => atob(s));
        const decoded = decode(hashContent);
        if (decoded.startsWith("{")) {
          return JSON.parse(decoded);
        }
      } catch (e) {
      }
    }
  } catch (e) {
    return null;
  }
  return null;
}
function detectPlaygroundQueryApiUrl(url) {
  if (!url || typeof url !== "string") {
    return false;
  }
  const trimmed = url.trim();
  try {
    const urlObj = new URL(trimmed);
    if (isPlaygroundDomain(urlObj.hostname) && urlObj.search) {
      return true;
    }
  } catch (e) {
    return false;
  }
  return false;
}
function detectBlueprintJson(text) {
  if (!text || typeof text !== "string") {
    return null;
  }
  const trimmed = text.trim();
  if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) {
    return null;
  }
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === "object") {
      const blueprintProps = ["steps", "landingPage", "preferredVersions", "features", "siteOptions", "login", "plugins", "constants", "phpExtensionBundles"];
      const hasAnyBlueprintProp = blueprintProps.some((prop) => prop in parsed);
      if (hasAnyBlueprintProp) {
        return parsed;
      }
    }
    return null;
  } catch (e) {
    return null;
  }
}
function detectCss(text) {
  if (!text || typeof text !== "string") {
    return false;
  }
  const trimmed = text.trim();
  const cssPatterns = [
    /^[.#]?[\w-]+\s*\{/,
    /^\s*@(media|import|keyframes|font-face)/,
    /\{\s*[\w-]+\s*:\s*[^}]+\}/,
    /^\s*\/\*.*\*\//
  ];
  return cssPatterns.some((pattern) => pattern.test(trimmed));
}
function detectJs(text) {
  if (!text || typeof text !== "string") {
    return false;
  }
  const trimmed = text.trim();
  const jsPatterns = [
    /^(var|let|const)\s+\w+/,
    /^function\s+\w+/,
    /^(async\s+)?function\s*\(/,
    /=>\s*[{(]/,
    /^import\s+/,
    /^export\s+/,
    /console\.(log|error|warn)/,
    /document\.(querySelector|getElementById|addEventListener)/,
    /window\.\w+/,
    /^\s*\/\/.*/,
    /^\s*\/\*[\s\S]*\*\//
  ];
  return jsPatterns.some((pattern) => pattern.test(trimmed));
}
function detectWpCli(text) {
  if (!text || typeof text !== "string") {
    return null;
  }
  const lines = text.split("\n").map((line) => line.trim());
  const commands = [];
  for (const line of lines) {
    if (line.startsWith("wp ") || line.match(/^\$\s+wp\s+/)) {
      const command = line.replace(/^\$\s+/, "").replace(/^wp\s+/, "");
      if (command) {
        commands.push(command);
      }
    }
  }
  return commands.length > 0 ? commands : null;
}
function detectStepJson(text) {
  if (!text || typeof text !== "string") {
    return null;
  }
  const trimmed = text.trim();
  if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) {
    return null;
  }
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === "object" && "step" in parsed && typeof parsed.step === "string") {
      return parsed;
    }
    return null;
  } catch (e) {
    return null;
  }
}
function detectStepLibraryRedirectUrl(url) {
  if (!url || typeof url !== "string") {
    return null;
  }
  const trimmed = url.trim();
  try {
    const urlObj = new URL(trimmed);
    const params = urlObj.searchParams;
    const paramMap = {};
    for (const [key, value] of params.entries()) {
      const arrayMatch = key.match(/^(\w+)\[(\d+)\]$/);
      if (arrayMatch) {
        const paramName = arrayMatch[1];
        const index = parseInt(arrayMatch[2], 10);
        if (!paramMap[paramName]) {
          paramMap[paramName] = {};
        }
        paramMap[paramName][index] = value;
      }
    }
    if (!paramMap.step || Object.keys(paramMap.step).length === 0) {
      return null;
    }
    const indices = Object.keys(paramMap.step).sort((a, b) => parseInt(a) - parseInt(b));
    const steps = indices.map((index) => {
      const idx = parseInt(index);
      const stepName = paramMap.step[idx];
      const vars = {};
      for (const [paramName, values] of Object.entries(paramMap)) {
        if (paramName !== "step" && values[idx] !== void 0) {
          vars[paramName] = values[idx];
        }
      }
      return { step: stepName, vars };
    });
    return steps;
  } catch (e) {
    return null;
  }
}
function normalizeWordPressUrl(url, urlType) {
  if (!url || !urlType) {
    return url;
  }
  if (urlType === "plugin") {
    const pluginMatch = url.match(/^https?:\/\/downloads\.wordpress\.org\/plugin\/([^.]+)\..*\.zip$/);
    if (pluginMatch) {
      const slug = pluginMatch[1];
      return `https://wordpress.org/plugins/${slug}/`;
    }
  }
  if (urlType === "theme") {
    const themeMatch = url.match(/^https?:\/\/downloads\.wordpress\.org\/theme\/([^.]+)\..*\.zip$/);
    if (themeMatch) {
      const slug = themeMatch[1];
      return `https://wordpress.org/themes/${slug}/`;
    }
  }
  return url;
}
function parsePlaygroundQueryApi(url) {
  if (!url || typeof url !== "string") {
    return null;
  }
  try {
    const urlObj = new URL(url.trim());
    if (!isPlaygroundDomain(urlObj.hostname)) {
      return null;
    }
    const params = urlObj.searchParams;
    const blueprint = {};
    if (params.has("php")) {
      blueprint.phpExtensionBundles = [params.get("php")];
    }
    if (params.has("wp")) {
      blueprint.preferredVersions = { wp: params.get("wp") };
    }
    if (params.has("multisite")) {
      const value = params.get("multisite");
      if (value === "yes" || value === "true" || value === "1") {
        blueprint.features = { networking: true };
      }
    }
    if (params.has("login")) {
      const value = params.get("login");
      if (value === "yes" || value === "true" || value === "1") {
        blueprint.login = true;
      }
    }
    const steps = [];
    const plugins = params.getAll("plugin");
    for (const plugin of plugins) {
      steps.push({
        step: "installPlugin",
        pluginData: { resource: "wordpress.org/plugins", slug: plugin }
      });
    }
    const themes = params.getAll("theme");
    for (const theme of themes) {
      steps.push({
        step: "installTheme",
        themeData: { resource: "wordpress.org/themes", slug: theme }
      });
    }
    if (params.has("gutenberg-pr")) {
      const pr = params.get("gutenberg-pr");
      steps.push({
        step: "installPlugin",
        pluginData: {
          resource: "url",
          url: `https://plugin-proxy.wordpress.net/gutenberg/gutenberg-build-pr-${pr}.zip`
        }
      });
    }
    if (params.has("core-pr")) {
      const pr = params.get("core-pr");
      steps.push({
        step: "runPHP",
        code: `<?php require '/wordpress/wp-load.php'; wp_install_core_pr(${pr});`
      });
    }
    if (steps.length > 0) {
      blueprint.steps = steps;
    }
    if (params.has("url")) {
      blueprint.landingPage = params.get("url");
    }
    if (params.has("mode")) {
      const mode = params.get("mode");
      if (mode === "seamless") {
        blueprint.preferredVersions = blueprint.preferredVersions || {};
        blueprint.preferredVersions.seamless = true;
      }
    }
    if (params.has("language")) {
      blueprint.siteOptions = blueprint.siteOptions || {};
      blueprint.siteOptions.WPLANG = params.get("language");
    }
    return blueprint;
  } catch (e) {
    console.error("Error parsing Query API URL:", e);
    return null;
  }
}
function shouldUseMuPlugin(phpCode) {
  const hookIndicators = [
    "add_action(",
    "add_filter(",
    "remove_action(",
    "remove_filter(",
    "register_post_type(",
    "register_taxonomy(",
    "add_shortcode("
  ];
  return hookIndicators.some((indicator) => phpCode.includes(indicator));
}
const addPost = (step) => {
  const title = step.vars?.title || step.vars?.postTitle || "";
  const content = step.vars?.content || step.vars?.postContent || "";
  const postType = step.vars?.type || step.vars?.postType || "post";
  const postStatus = step.vars?.status || step.vars?.postStatus || "publish";
  const postId = step.vars?.postId !== void 0 && step.vars?.postId !== null && String(step.vars?.postId) !== "" ? Number(step.vars?.postId) : 0;
  const dateValue = step.vars?.date || step.vars?.postDate;
  return {
    toV1() {
      const postTitle = title.replace(/'/g, "\\'");
      const postContent = content.replace(/'/g, "\\'");
      let code = `
<?php require_once '/wordpress/wp-load.php';
$page_args = array(
	'post_type'    => '${postType}',
	'post_status'  => '${postStatus}',
	'post_title'   => '${postTitle}',
	'post_content' => '${postContent}',`;
      if (postId > 0) {
        code += `
	'import_id'    => ${postId},`;
      }
      if (dateValue && dateValue !== "now") {
        const postDate = dateValue.replace(/'/g, "\\'");
        code += `
	'post_date'    => date( 'Y-m-d H:i:s', strtotime( '${postDate}' ) ),`;
      }
      code += `
);
$page_id = wp_insert_post( $page_args, true );
if ( is_wp_error( $page_id ) ) {
	error_log( 'addPost error: ' . $page_id->get_error_message() );
}`;
      if (step.vars?.homepage) {
        code += "update_option( 'page_on_front', $page_id );";
        code += "update_option( 'show_on_front', 'page' );";
      }
      const result = {
        steps: [
          {
            step: "runPHP",
            code,
            progress: {
              caption: `addPost: ${title}`
            }
          }
        ]
      };
      if (step.vars?.landingPage !== false && postId > 0) {
        result.landingPage = `/wp-admin/post.php?post=${postId}&action=edit`;
      }
      return result;
    },
    toV2() {
      const postData = {
        post_title: title,
        post_content: content,
        post_type: postType,
        post_status: postStatus
      };
      if (dateValue && dateValue !== "now") {
        postData.post_date = dateValue;
      }
      if (postId > 0) {
        postData.import_id = postId;
      }
      const result = {
        version: 2,
        content: [{
          type: "posts",
          source: postData
        }]
      };
      if (step.vars?.homepage) {
        result.siteOptions = {
          show_on_front: "page"
        };
        result.additionalStepsAfterExecution = [{
          step: "runPHP",
          code: {
            filename: "set-homepage.php",
            content: `<?php
require_once '/wordpress/wp-load.php';
$pages = get_posts( array(
	'post_type' => '${postType}',
	'title' => '${title.replace(/'/g, "\\'")}',
	'posts_per_page' => 1,
	'orderby' => 'ID',
	'order' => 'DESC'
) );
if ( ! empty( $pages ) ) {
	update_option( 'page_on_front', $pages[0]->ID );
	update_option( 'show_on_front', 'page' );
}`
          }
        }];
      }
      if (step.vars?.landingPage !== false && postId > 0) {
        result.applicationOptions = {
          "wordpress-playground": {
            landingPage: `/wp-admin/post.php?post=${postId}&action=edit`
          }
        };
      }
      return result;
    }
  };
};
addPost.description = "Add a post with title, content, type, status, and date.";
addPost.vars = [
  {
    name: "title",
    description: "The title of the post",
    required: true,
    samples: ["Hello World"]
  },
  {
    name: "content",
    description: "The HTML content of the post",
    type: "textarea",
    language: "markup",
    required: true,
    samples: ["<p>Hello World</p>"]
  },
  {
    name: "date",
    description: "The date of the post (optional)",
    required: false,
    samples: ["now", "2024-01-01 00:00:00"]
  },
  {
    name: "type",
    description: "The post type",
    required: false,
    regex: "^[a-z][a-z0-9_]+$",
    samples: ["post", "page", "custom"]
  },
  {
    name: "status",
    description: "The post status",
    required: false,
    samples: ["publish", "draft", "private", "pending"]
  },
  {
    name: "postId",
    description: "Post ID to use (optional)",
    type: "text",
    required: false,
    samples: ["", "1000", "2000", "5000"]
  },
  {
    name: "landingPage",
    description: "Set landing page to the post editor (requires postId)",
    type: "boolean",
    required: false,
    samples: ["false", "true"]
  },
  {
    name: "postTitle",
    description: "The title of the post (deprecated: use 'title')",
    required: false,
    samples: ["Hello World"],
    deprecated: true
  },
  {
    name: "postContent",
    description: "The HTML content of the post (deprecated: use 'content')",
    type: "textarea",
    language: "markup",
    required: false,
    samples: ["<p>Hello World</p>"],
    deprecated: true
  },
  {
    name: "postDate",
    description: "The date of the post (deprecated: use 'date')",
    required: false,
    samples: ["now", "2024-01-01 00:00:00"],
    deprecated: true
  },
  {
    name: "postType",
    description: "The post type (deprecated: use 'type')",
    required: false,
    regex: "^[a-z][a-z0-9_]+$",
    samples: ["post", "page", "custom"],
    deprecated: true
  },
  {
    name: "postStatus",
    description: "The post status (deprecated: use 'status')",
    required: false,
    samples: ["publish", "draft", "private", "pending"],
    deprecated: true
  }
];
addPost.vars.push({
  name: "registerPostType",
  description: "Register custom post type if needed",
  label: "Register post type",
  type: "button",
  show: function(step) {
    const postType = step.querySelector("[name=type], [name=postType]")?.value;
    return postType && !["post", "page"].includes(postType);
  },
  onclick: function(event, loadCombinedExamples) {
    const step = event.target.closest(".step");
    const postTypeElement = step?.querySelector("[name=type], [name=postType]");
    const postType = postTypeElement?.value;
    const stepClone = document.getElementById("step-customPostType")?.cloneNode(true);
    const slugInput = stepClone?.querySelector("[name=slug]");
    const nameInput = stepClone?.querySelector("[name=name]");
    if (slugInput) slugInput.value = postType || "";
    if (nameInput && postType) nameInput.value = postType.substr(0, 1).toUpperCase() + postType.substr(1);
    const stepsContainer = document.getElementById("blueprint-steps");
    if (stepsContainer && stepClone) {
      stepsContainer.insertBefore(stepClone, step);
    }
    loadCombinedExamples();
  }
});
function makeStep(stepName, vars) {
  return { step: stepName, vars };
}
class BlueprintDecompiler {
  constructor() {
    this.warnings = [];
    this.unmappedSteps = [];
  }
  decompile(nativeBlueprint) {
    if (this.isV2Blueprint(nativeBlueprint)) {
      return this.decompileV2(nativeBlueprint);
    }
    return this.decompileV1(nativeBlueprint);
  }
  isV2Blueprint(blueprint) {
    return blueprint && blueprint.version === 2;
  }
  decompileV2(v2Blueprint) {
    this.warnings = [];
    this.unmappedSteps = [];
    const steps = [];
    if (v2Blueprint.plugins && Array.isArray(v2Blueprint.plugins)) {
      for (const plugin of v2Blueprint.plugins) {
        if (typeof plugin === "string") {
          steps.push(makeStep("installPlugin", {
            url: `https://wordpress.org/plugins/${plugin}/`,
            prs: false
          }));
        } else if (plugin && typeof plugin === "object") {
          const pluginStep = this.decompileV2Plugin(plugin);
          if (pluginStep) {
            steps.push(pluginStep);
          }
        }
      }
    }
    if (v2Blueprint.themes && Array.isArray(v2Blueprint.themes)) {
      for (const theme of v2Blueprint.themes) {
        if (typeof theme === "string") {
          steps.push(makeStep("installTheme", {
            url: `https://wordpress.org/themes/${theme}/`,
            prs: false
          }));
        } else if (theme && typeof theme === "object") {
          const themeStep = this.decompileV2Theme(theme);
          if (themeStep) {
            steps.push(themeStep);
          }
        }
      }
    }
    if (v2Blueprint.siteOptions && typeof v2Blueprint.siteOptions === "object") {
      const opts = v2Blueprint.siteOptions;
      const blogname = opts.blogname;
      const blogdescription = opts.blogdescription;
      if (blogname !== void 0 || blogdescription !== void 0) {
        steps.push(makeStep("setSiteName", {
          sitename: blogname || "",
          tagline: blogdescription || ""
        }));
      }
      for (const [name, value] of Object.entries(opts)) {
        if (name === "blogname" || name === "blogdescription") {
          continue;
        }
        steps.push(makeStep("setSiteOption", {
          name,
          value
        }));
      }
    }
    if (v2Blueprint.content && Array.isArray(v2Blueprint.content)) {
      for (const item of v2Blueprint.content) {
        if (item.type === "posts" && item.source) {
          const postType = item.source.post_type || "post";
          const stepName = postType === "page" ? "addPage" : "addPost";
          steps.push(makeStep(stepName, {
            title: item.source.post_title || "",
            content: item.source.post_content || ""
          }));
        }
      }
    }
    if (v2Blueprint.users && Array.isArray(v2Blueprint.users)) {
      for (const user of v2Blueprint.users) {
        steps.push(makeStep("createUser", {
          username: user.username,
          email: user.email || `${user.username}@example.com`,
          role: user.role || "subscriber"
        }));
      }
    }
    if (v2Blueprint.constants && typeof v2Blueprint.constants === "object") {
      const consts = v2Blueprint.constants;
      const wpDebug = consts.WP_DEBUG === true;
      const wpDebugDisplay = consts.WP_DEBUG_DISPLAY === true;
      const scriptDebug = consts.SCRIPT_DEBUG === true;
      if (wpDebug || wpDebugDisplay || scriptDebug) {
        steps.push(makeStep("debug", {
          wpDebug,
          wpDebugDisplay,
          scriptDebug,
          queryMonitor: false
        }));
      }
    }
    if (v2Blueprint.applicationOptions?.["wordpress-playground"]) {
      const appOpts = v2Blueprint.applicationOptions["wordpress-playground"];
      if (appOpts.login !== void 0) {
        if (appOpts.login === true || typeof appOpts.login === "object" && Object.keys(appOpts.login).length === 0) {
          steps.push(makeStep("login", {
            username: "admin",
            password: "password",
            landingPage: false
          }));
        } else if (typeof appOpts.login === "object") {
          steps.push(makeStep("login", {
            username: appOpts.login.username || "admin",
            password: appOpts.login.password || "password",
            landingPage: false
          }));
        }
      }
      if (appOpts.landingPage) {
        steps.push(makeStep("setLandingPage", { landingPage: appOpts.landingPage }));
      }
    }
    if (v2Blueprint.muPlugins && Array.isArray(v2Blueprint.muPlugins)) {
      for (const muPlugin of v2Blueprint.muPlugins) {
        steps.push(makeStep("muPlugin", {
          name: muPlugin.name || "mu-plugin",
          code: muPlugin.code || ""
        }));
      }
    }
    if (v2Blueprint.additionalStepsAfterExecution && Array.isArray(v2Blueprint.additionalStepsAfterExecution)) {
      for (let i = 0; i < v2Blueprint.additionalStepsAfterExecution.length; i++) {
        const nativeStep = v2Blueprint.additionalStepsAfterExecution[i];
        const decompiled = this.decompileStep(nativeStep, v2Blueprint.additionalStepsAfterExecution, i);
        if (decompiled) {
          if (Array.isArray(decompiled)) {
            steps.push(...decompiled);
          } else {
            steps.push(decompiled);
          }
        } else {
          this.unmappedSteps.push(nativeStep);
        }
      }
    }
    const confidence = this.calculateConfidence(steps.length, this.unmappedSteps.length);
    return {
      steps,
      unmappedSteps: this.unmappedSteps,
      confidence,
      warnings: this.warnings
    };
  }
  decompileV2Plugin(plugin) {
    if (plugin.resource === "wordpress.org/plugins" && plugin.slug) {
      return makeStep("installPlugin", {
        url: `https://wordpress.org/plugins/${plugin.slug}/`,
        prs: false
      });
    }
    if (plugin.resource === "url" && plugin.url) {
      return makeStep("installPlugin", { url: plugin.url, prs: false, permalink: false });
    }
    this.warnings.push(`Unknown V2 plugin resource type: ${plugin.resource}`);
    return null;
  }
  decompileV2Theme(theme) {
    if (theme.resource === "wordpress.org/themes" && theme.slug) {
      return makeStep("installTheme", {
        url: `https://wordpress.org/themes/${theme.slug}/`,
        prs: false
      });
    }
    if (theme.resource === "url" && theme.url) {
      return makeStep("installTheme", { url: theme.url, prs: false, permalink: false });
    }
    this.warnings.push(`Unknown V2 theme resource type: ${theme.resource}`);
    return null;
  }
  decompileV1(nativeBlueprint) {
    this.warnings = [];
    this.unmappedSteps = [];
    const steps = [];
    if (nativeBlueprint.plugins && Array.isArray(nativeBlueprint.plugins)) {
      for (const plugin of nativeBlueprint.plugins) {
        if (typeof plugin === "string") {
          steps.push(makeStep("installPlugin", {
            url: `https://wordpress.org/plugins/${plugin}/`,
            prs: false
          }));
        } else if (plugin && typeof plugin === "object") {
          const pluginStep = this.decompileInstallPlugin({
            step: "installPlugin",
            pluginData: plugin,
            options: { activate: true }
          });
          if (pluginStep) {
            steps.push(pluginStep);
          }
        }
      }
    }
    if (nativeBlueprint.login) {
      if (nativeBlueprint.login === true) {
        steps.push(makeStep("login", {
          username: "admin",
          password: "password",
          landingPage: false
        }));
      } else if (typeof nativeBlueprint.login === "object") {
        steps.push(makeStep("login", {
          username: nativeBlueprint.login.username || "admin",
          password: nativeBlueprint.login.password || "password",
          landingPage: false
        }));
      }
    }
    const nativeSteps = nativeBlueprint.steps || [];
    for (let i = 0; i < nativeSteps.length; i++) {
      const nativeStep = nativeSteps[i];
      const decompiled = this.decompileStep(nativeStep, nativeSteps, i);
      if (decompiled) {
        if (Array.isArray(decompiled)) {
          steps.push(...decompiled);
        } else {
          steps.push(decompiled);
        }
      } else {
        this.unmappedSteps.push(nativeStep);
      }
    }
    if (nativeBlueprint.siteOptions && typeof nativeBlueprint.siteOptions === "object") {
      for (const [name, value] of Object.entries(nativeBlueprint.siteOptions)) {
        if (name === "blogname" || name === "blogdescription") {
          const existing = steps.find((s) => s.step === "setSiteName");
          if (!existing) {
            const blogname = nativeBlueprint.siteOptions.blogname || "";
            const blogdescription = nativeBlueprint.siteOptions.blogdescription || "";
            if (blogname || blogdescription) {
              steps.push(makeStep("setSiteName", {
                sitename: blogname,
                tagline: blogdescription
              }));
            }
          }
          continue;
        }
        steps.push(makeStep("setSiteOption", {
          name,
          value
        }));
      }
    }
    if (nativeBlueprint.constants && typeof nativeBlueprint.constants === "object") {
      const consts = nativeBlueprint.constants;
      const wpDebug = consts.WP_DEBUG === true;
      const wpDebugDisplay = consts.WP_DEBUG_DISPLAY === true;
      const scriptDebug = consts.SCRIPT_DEBUG === true;
      if (wpDebug || wpDebugDisplay || scriptDebug) {
        steps.push(makeStep("debug", {
          wpDebug,
          wpDebugDisplay,
          scriptDebug,
          queryMonitor: false
        }));
      }
    }
    if (nativeBlueprint.landingPage) {
      steps.push(makeStep("setLandingPage", { landingPage: nativeBlueprint.landingPage }));
    }
    const confidence = this.calculateConfidence(steps.length, this.unmappedSteps.length);
    return {
      steps,
      unmappedSteps: this.unmappedSteps,
      confidence,
      warnings: this.warnings
    };
  }
  decompileStep(nativeStep, allSteps, index) {
    if (!nativeStep || !nativeStep.step) {
      return null;
    }
    switch (nativeStep.step) {
      case "installPlugin":
        return this.decompileInstallPlugin(nativeStep);
      case "installTheme":
        return this.decompileInstallTheme(nativeStep);
      case "runPHP":
        return this.decompileRunPHP(nativeStep);
      case "writeFile":
        return this.decompileWriteFile(nativeStep);
      case "defineWpConfigConsts":
        return this.decompileDefineWpConfigConsts(nativeStep, allSteps, index);
      case "setSiteOptions":
        return this.decompileSetSiteOptions(nativeStep);
      case "login":
        return this.decompileLogin(nativeStep);
      case "wp-cli":
        return this.decompileWpCli(nativeStep);
      case "activatePlugin":
        return this.decompileActivatePlugin(nativeStep);
      case "activateTheme":
        return this.decompileActivateTheme(nativeStep);
      case "cp":
        return this.decompileCp(nativeStep);
      case "mv":
        return this.decompileMv(nativeStep);
      case "rm":
        return this.decompileRm(nativeStep);
      case "rmdir":
        return this.decompileRmdir(nativeStep);
      case "mkdir":
        return this.decompileMkdir(nativeStep);
      case "unzip":
        return this.decompileUnzip(nativeStep);
      case "runSql":
        return this.decompileRunSQL(nativeStep);
      case "importWxr":
        return this.decompileImportWxr(nativeStep);
      default:
        this.warnings.push(`Unknown native step type: ${nativeStep.step}`);
        return null;
    }
  }
  decompileInstallPlugin(nativeStep) {
    const pluginData = nativeStep.pluginData || {};
    const resource = pluginData.resource;
    if (resource === "wordpress.org/plugins" && pluginData.slug) {
      return makeStep("installPlugin", {
        url: `https://wordpress.org/plugins/${pluginData.slug}/`,
        prs: false
      });
    }
    if (resource === "git:directory" && pluginData.url) {
      return this.decompileGitResource(pluginData, "installPlugin");
    }
    if (resource === "url" && pluginData.url) {
      const downloadsMatch = pluginData.url.match(/^https?:\/\/downloads\.wordpress\.org\/plugin\/([^.]+)\..*\.zip$/);
      if (downloadsMatch) {
        const slug = downloadsMatch[1];
        return makeStep("installPlugin", {
          url: `https://wordpress.org/plugins/${slug}/`,
          prs: false
        });
      }
      return makeStep("installPlugin", { url: pluginData.url, prs: false, permalink: false });
    }
    if (resource === "literal") {
      return { step: "installPlugin", pluginData };
    }
    if (resource === "vfs" && pluginData.path) {
      return { step: "installPlugin", pluginData };
    }
    if (resource === "core-plugin" && pluginData.slug) {
      return { step: "installPlugin", pluginData };
    }
    this.warnings.push(`Unknown plugin resource type: ${resource}`);
    return null;
  }
  decompileInstallTheme(nativeStep) {
    const themeData = nativeStep.themeData || {};
    const resource = themeData.resource;
    if (resource === "wordpress.org/themes" && themeData.slug) {
      return makeStep("installTheme", {
        url: `https://wordpress.org/themes/${themeData.slug}/`,
        prs: false
      });
    }
    if (resource === "git:directory" && themeData.url) {
      return this.decompileGitResource(themeData, "installTheme");
    }
    if (resource === "url" && themeData.url) {
      const downloadsMatch = themeData.url.match(/^https?:\/\/downloads\.wordpress\.org\/theme\/([^.]+)\..*\.zip$/);
      if (downloadsMatch) {
        const slug = downloadsMatch[1];
        return makeStep("installTheme", {
          url: `https://wordpress.org/themes/${slug}/`,
          prs: false
        });
      }
      return makeStep("installTheme", { url: themeData.url, prs: false, permalink: false });
    }
    if (resource === "literal") {
      return { step: "installTheme", themeData };
    }
    if (resource === "vfs" && themeData.path) {
      return { step: "installTheme", themeData };
    }
    if (resource === "core-theme" && themeData.slug) {
      return { step: "installTheme", themeData };
    }
    this.warnings.push(`Unknown theme resource type: ${resource}`);
    return null;
  }
  decompileGitResource(resourceData, stepType) {
    const urlMatch = resourceData.url?.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!urlMatch) {
      this.warnings.push(`Could not parse git:directory URL: ${resourceData.url}`);
      return null;
    }
    const [, owner, repo] = urlMatch;
    const ref = resourceData.ref || "HEAD";
    const directory = resourceData.path || "";
    const prMatch = ref.match(/refs\/pull\/(\d+)\//);
    if (prMatch) {
      const prNumber = prMatch[1];
      return makeStep(stepType, {
        url: `https://github.com/${owner}/${repo}/pull/${prNumber}`,
        auth: true,
        prs: false,
        permalink: false
      });
    }
    const branchMatch = ref.match(/^(?:refs\/heads\/)?(.+)$/);
    if (branchMatch && ref !== "HEAD") {
      const branch = branchMatch[1];
      let url2 = `https://github.com/${owner}/${repo}/tree/${branch}`;
      if (directory) {
        url2 = `https://github.com/${owner}/${repo}/tree/${branch}//${directory}`;
      }
      return makeStep(stepType, {
        url: url2,
        prs: false,
        permalink: false
      });
    }
    const commitMatch = ref.match(/^[a-f0-9]{40}$/i);
    if (commitMatch) {
      let url2 = `https://github.com/${owner}/${repo}/tree/${ref}`;
      if (directory) {
        url2 = `https://github.com/${owner}/${repo}/tree/${ref}//${directory}`;
      }
      return makeStep(stepType, {
        url: url2,
        prs: false,
        permalink: false
      });
    }
    let url = `https://github.com/${owner}/${repo}`;
    if (directory) {
      url = `https://github.com/${owner}/${repo}/tree/HEAD//${directory}`;
    }
    return makeStep(stepType, {
      url,
      prs: false,
      permalink: false
    });
  }
  decompileRunPHP(nativeStep) {
    const code = nativeStep.code || "";
    const caption = nativeStep.progress?.caption || "";
    if (caption.startsWith("blockExamples:")) {
      return this.decompileBlockExamples(code, caption);
    }
    if (caption.startsWith("Importing feeds to Friends")) {
      return this.decompileImportFriendFeeds(code);
    }
    if (code.includes("wp_insert_post") && code.includes("post_title")) {
      return this.decompileAddPageOrPost(code, caption);
    }
    return makeStep("runPHP", { code });
  }
  decompileBlockExamples(code, caption) {
    const blockNamespaceMatch = code.match(/\$block_namespace\s*=\s*['"]([^'"]*)['"]/);
    const limitMatch = code.match(/\$limit\s*=\s*(\d+)/);
    const postIdMatch = code.match(/\$post_id\s*=\s*(\d+)/);
    const excludeCoreMatch = code.match(/\$exclude_core\s*=\s*(true|false)/);
    const postTitleMatch = code.match(/['"]post_title['"]\s*=>\s*['"]([^'"]+)['"]/);
    return makeStep("blockExamples", {
      blockNamespace: blockNamespaceMatch ? blockNamespaceMatch[1] : "",
      postTitle: postTitleMatch ? postTitleMatch[1] : "Block Examples",
      limit: limitMatch ? limitMatch[1] : "",
      postId: postIdMatch ? postIdMatch[1] : "1000",
      excludeCore: excludeCoreMatch ? excludeCoreMatch[1] === "true" : false,
      landingPage: caption.includes("landingPage") || code.includes("landingPage")
    });
  }
  decompileImportFriendFeeds(code) {
    const feedsMatch = code.match(/\$feeds\s*=\s*array\((.*?)\);/s);
    if (!feedsMatch) {
      this.warnings.push("Could not parse Friends feeds from runPHP");
      return null;
    }
    const feedsArrayContent = feedsMatch[1];
    const feedMatches = feedsArrayContent.matchAll(/array\(['"]([^'"]+)['"],\s*['"]([^'"]+)['"]\)/g);
    const feeds = [];
    for (const match of feedMatches) {
      feeds.push(`${match[1]} ${match[2]}`);
    }
    return makeStep("importFriendFeeds", { opml: feeds.join("\n") });
  }
  decompileAddPageOrPost(code, caption) {
    const titleMatch = code.match(/['"]post_title['"]\s*=>\s*['"]([^'"]+)['"]/);
    const contentMatch = code.match(/['"]post_content['"]\s*=>\s*['"]([^'"]+)['"]/);
    const typeMatch = code.match(/['"]post_type['"]\s*=>\s*['"]([^'"]+)['"]/);
    let isPost = typeMatch && typeMatch[1] === "post";
    if (!isPost && caption.startsWith("addPost:")) {
      isPost = true;
    }
    const step = isPost ? "addPost" : "addPage";
    return makeStep(step, {
      title: titleMatch ? titleMatch[1] : "",
      content: contentMatch ? contentMatch[1] : ""
    });
  }
  decompileWriteFile(nativeStep) {
    const path2 = nativeStep.path || "";
    const data = nativeStep.data || "";
    if (path2.startsWith("/wordpress/wp-content/mu-plugins/")) {
      const addFilterStep = this.decompileAddFilterFromCode(data);
      if (addFilterStep) {
        return addFilterStep;
      }
      const filename = path2.split("/").pop();
      const nameMatch = filename?.match(/^(.+?)(?:-\d+)?\.php$/);
      const name = nameMatch ? nameMatch[1] : filename?.replace(".php", "") || "my-plugin";
      return makeStep("muPlugin", {
        name,
        code: data
      });
    }
    this.warnings.push(`Could not decompile writeFile: ${path2}`);
    return null;
  }
  decompileAddFilterFromCode(code) {
    const cleanCode = code.replace(/<\?php\s*/i, "").trim();
    const singleAddFilterPattern = /^add_filter\s*\(\s*['"]([^'"]+)['"]\s*,\s*(.+?)\s*\)\s*;?\s*$/s;
    const match = cleanCode.match(singleAddFilterPattern);
    if (!match) {
      return null;
    }
    const filterName = match[1];
    let callback = match[2].trim();
    if (callback.startsWith("'") && callback.endsWith("'")) {
      callback = callback.slice(1, -1);
    } else if (callback.startsWith('"') && callback.endsWith('"')) {
      callback = callback.slice(1, -1);
    }
    return makeStep("addFilter", {
      filter: filterName,
      code: callback
    });
  }
  decompileDefineWpConfigConsts(nativeStep, allSteps, index) {
    const consts = nativeStep.consts || {};
    const wpDebug = consts.WP_DEBUG === true;
    const wpDebugDisplay = consts.WP_DEBUG_DISPLAY === true;
    const scriptDebug = consts.SCRIPT_DEBUG === true;
    let queryMonitor = false;
    for (let i = index + 1; i < allSteps.length; i++) {
      const nextStep = allSteps[i];
      if (nextStep.step === "installPlugin" && nextStep.pluginData?.slug === "query-monitor") {
        queryMonitor = true;
        break;
      }
    }
    return makeStep("debug", {
      wpDebug,
      wpDebugDisplay,
      scriptDebug,
      queryMonitor
    });
  }
  decompileSetSiteOptions(nativeStep) {
    const options = nativeStep.options || {};
    if (options.blogname !== void 0 && options.blogdescription !== void 0) {
      return makeStep("setSiteName", {
        sitename: options.blogname,
        tagline: options.blogdescription
      });
    }
    if (options.blogname !== void 0) {
      return makeStep("setSiteName", {
        sitename: options.blogname,
        tagline: ""
      });
    }
    if (options.permalink_structure) {
      this.warnings.push("setSiteOptions with permalink_structure may be part of setLandingPage");
    }
    return null;
  }
  decompileWpCli(nativeStep) {
    const command = nativeStep.command;
    if (!command) {
      this.warnings.push("wp-cli step missing command");
      return null;
    }
    return makeStep("runWpCliCommand", { command });
  }
  decompileLogin(nativeStep) {
    const username = nativeStep.username || "admin";
    const password = nativeStep.password || "password";
    return makeStep("login", {
      username,
      password,
      landingPage: false
    });
  }
  decompileActivatePlugin(nativeStep) {
    return {
      step: "activatePlugin",
      pluginPath: nativeStep.pluginPath || "",
      pluginName: nativeStep.pluginName
    };
  }
  decompileActivateTheme(nativeStep) {
    return {
      step: "activateTheme",
      themeFolderName: nativeStep.themeFolderName || nativeStep.themeDirectoryName || ""
    };
  }
  decompileCp(nativeStep) {
    return {
      step: "cp",
      fromPath: this.translatePath(nativeStep.fromPath || ""),
      toPath: this.translatePath(nativeStep.toPath || "")
    };
  }
  decompileMv(nativeStep) {
    return {
      step: "mv",
      fromPath: this.translatePath(nativeStep.fromPath || ""),
      toPath: this.translatePath(nativeStep.toPath || "")
    };
  }
  decompileRm(nativeStep) {
    return {
      step: "rm",
      path: this.translatePath(nativeStep.path || "")
    };
  }
  decompileRmdir(nativeStep) {
    return {
      step: "rmdir",
      path: this.translatePath(nativeStep.path || "")
    };
  }
  decompileMkdir(nativeStep) {
    const path2 = nativeStep.path || "";
    const setupDirectories = [
      "/wordpress/wp-content/mu-plugins",
      "wp-content/mu-plugins",
      "/wordpress/wp-content/plugins",
      "wp-content/plugins",
      "/wordpress/wp-content/themes",
      "wp-content/themes",
      "/wordpress/wp-content/uploads",
      "wp-content/uploads"
    ];
    if (setupDirectories.includes(path2)) {
      return null;
    }
    return {
      step: "mkdir",
      path: this.translatePath(path2)
    };
  }
  decompileUnzip(nativeStep) {
    const result = {
      step: "unzip",
      extractToPath: this.translatePath(nativeStep.extractToPath || "")
    };
    if (nativeStep.zipFile) {
      result.zipFile = nativeStep.zipFile;
    }
    if (nativeStep.zipPath) {
      result.zipPath = this.translatePath(nativeStep.zipPath);
    }
    return result;
  }
  decompileRunSQL(nativeStep) {
    return {
      step: "runSql",
      sql: nativeStep.sql
    };
  }
  decompileImportWxr(nativeStep) {
    return {
      step: "importWxr",
      file: nativeStep.file
    };
  }
  translatePath(path2) {
    if (!path2) {
      return path2;
    }
    if (path2.startsWith("/wordpress/")) {
      return path2.substring(10);
    }
    if (path2.startsWith("wordpress/")) {
      return path2.substring(10);
    }
    return path2;
  }
  calculateConfidence(mappedCount, unmappedCount) {
    if (unmappedCount === 0 && mappedCount > 0) {
      return "high";
    }
    const mappedRatio = mappedCount / (mappedCount + unmappedCount);
    if (mappedRatio >= 0.8) {
      return "high";
    }
    if (mappedRatio >= 0.5) {
      return "medium";
    }
    return "low";
  }
}
function decodeBase64(str) {
  return Buffer.from(str, "base64").toString("utf8");
}
function extractPluginName(phpCode) {
  const pluginNameMatch = phpCode.match(/\*\s*Plugin\s+Name:\s*(.+)/i);
  if (pluginNameMatch) {
    return pluginNameMatch[1].trim();
  }
  return null;
}
function nameToSlug(name) {
  return name.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
}
function convertBlueprintToStepLibrary(blueprintData) {
  if (!blueprintData) {
    return null;
  }
  const result = { steps: [] };
  if (blueprintData.preferredVersions) {
    result.preferredVersions = blueprintData.preferredVersions;
  }
  if (blueprintData.landingPage) {
    result.landingPage = blueprintData.landingPage;
  }
  if (blueprintData.wpVersion || blueprintData.phpVersion) {
    result.preferredVersions = result.preferredVersions || {};
    if (blueprintData.wpVersion) {
      result.preferredVersions.wp = blueprintData.wpVersion;
    }
    if (blueprintData.phpVersion) {
      result.preferredVersions.php = blueprintData.phpVersion;
    }
  }
  if (blueprintData.title) {
    result.title = blueprintData.title;
  }
  const blueprintSteps = blueprintData.steps || [];
  const customSteps = [];
  const nativeSteps = [];
  for (const step of blueprintSteps) {
    if (!step.step) {
      continue;
    }
    if ("vars" in step && typeof step.vars === "object") {
      customSteps.push(step);
      continue;
    }
    if ((step.step === "installPlugin" || step.step === "installTheme") && "url" in step) {
      customSteps.push(step);
      continue;
    }
    nativeSteps.push(step);
  }
  for (const step of customSteps) {
    if ("vars" in step && typeof step.vars === "object") {
      result.steps.push({ step: step.step, vars: step.vars });
    } else {
      const vars = {};
      for (const key in step) {
        if (key !== "step") {
          vars[key] = step[key];
        }
      }
      result.steps.push({ step: step.step, vars });
    }
  }
  if (nativeSteps.length > 0) {
    const decompiler = new BlueprintDecompiler();
    const decompiled = decompiler.decompile({ ...blueprintData, steps: nativeSteps });
    for (const step of decompiled.steps) {
      if ("vars" in step && typeof step.vars === "object") {
        result.steps.push({ step: step.step, vars: step.vars });
      } else {
        const vars = {};
        for (const key in step) {
          if (key !== "step") {
            vars[key] = step[key];
          }
        }
        result.steps.push({ step: step.step, vars });
      }
    }
  }
  return result;
}
function detectContentType(text) {
  const lines = text.split("\n").map((line) => line.trim()).filter((line) => line);
  for (const line of lines) {
    if (detectPlaygroundUrl(line, decodeBase64)) {
      return "playgroundUrl";
    }
    if (detectPlaygroundQueryApiUrl(line)) {
      return "playgroundQueryApi";
    }
    if (detectStepLibraryRedirectUrl(line)) {
      return "stepLibraryRedirect";
    }
    if (detectWpAdminUrl(line)) {
      return "wpAdminUrl";
    }
    if (detectUrlType(line)) {
      return "url";
    }
  }
  if (detectBlueprintJson(text)) {
    return "blueprintJson";
  }
  if (detectStepJson(text)) {
    return "stepJson";
  }
  if (detectPhp(text)) {
    return "php";
  }
  if (detectHtml(text)) {
    return "html";
  }
  if (detectWpCli(text)) {
    return "wpCli";
  }
  if (detectCss(text)) {
    return "css";
  }
  if (detectJs(text)) {
    return "js";
  }
  return null;
}
function processPaste(text) {
  if (!text || typeof text !== "string") {
    return null;
  }
  const lines = text.split("\n").map((line) => line.trim()).filter((line) => line);
  const steps = [];
  for (const line of lines) {
    const playgroundBlueprint = detectPlaygroundUrl(line, decodeBase64);
    if (playgroundBlueprint) {
      return convertBlueprintToStepLibrary(playgroundBlueprint);
    }
    if (detectPlaygroundQueryApiUrl(line)) {
      const blueprint = parsePlaygroundQueryApi(line);
      if (blueprint) {
        return convertBlueprintToStepLibrary(blueprint);
      }
    }
    const stepLibrarySteps = detectStepLibraryRedirectUrl(line);
    if (stepLibrarySteps) {
      return { steps: stepLibrarySteps };
    }
    const wpAdminPath = detectWpAdminUrl(line);
    if (wpAdminPath) {
      return {
        steps: [{ step: "setLandingPage", vars: { landingPage: wpAdminPath } }]
      };
    }
    const urlType = detectUrlType(line);
    if (urlType) {
      const normalizedUrl = normalizeWordPressUrl(line, urlType);
      const stepType = urlType === "theme" ? "installTheme" : "installPlugin";
      steps.push({ step: stepType, vars: { url: normalizedUrl } });
    }
  }
  if (steps.length > 0) {
    return { steps };
  }
  const blueprintData = detectBlueprintJson(text);
  if (blueprintData) {
    return convertBlueprintToStepLibrary(blueprintData);
  }
  const stepData = detectStepJson(text);
  if (stepData) {
    return convertBlueprintToStepLibrary({ steps: [stepData] });
  }
  if (detectPhp(text)) {
    const useMuPlugin = shouldUseMuPlugin(text);
    const stepType = useMuPlugin ? "muPlugin" : "runPHP";
    const vars = { code: text };
    if (useMuPlugin) {
      const pluginName = extractPluginName(text);
      vars.name = pluginName ? nameToSlug(pluginName) : "pasted-plugin";
    }
    return { steps: [{ step: stepType, vars }] };
  }
  if (detectHtml(text)) {
    return {
      steps: [{
        step: "addPost",
        vars: {
          title: "Pasted Content",
          content: text,
          type: "page"
        }
      }]
    };
  }
  const wpCliCommands = detectWpCli(text);
  if (wpCliCommands) {
    const cliSteps = wpCliCommands.map((command) => ({
      step: "runWpCliCommand",
      vars: { command }
    }));
    return { steps: cliSteps };
  }
  if (detectCss(text)) {
    return {
      steps: [{
        step: "enqueueCss",
        vars: {
          css: text,
          filename: "pasted-styles"
        }
      }]
    };
  }
  if (detectJs(text)) {
    return {
      steps: [{
        step: "enqueueJs",
        vars: {
          js: text,
          filename: "pasted-script"
        }
      }]
    };
  }
  return null;
}
function showHelp() {
  console.log(`
Playground Step Library - Paste Handler CLI

Detects content type from input and outputs step-library format JSON.

Usage:
  playground-paste [options] [input-file]
  echo "content" | playground-paste

Options:
  -o, --output <file>     Output file (default: stdout)
  -p, --pretty            Pretty print JSON output
  -t, --type              Show detected content type only
  -h, --help              Show this help

Supported Content Types:
  - WordPress Playground URLs (with blueprint hash, URL-encoded or base64)
  - Playground Query API URLs
  - Step Library redirect URLs (with step[] query params)
  - Blueprint JSON
  - Step JSON
  - PHP code (creates runPHP or muPlugin step)
  - HTML content (creates addPost step)
  - WP-CLI commands (creates runWpCliCommand steps)
  - CSS code (creates enqueueCss step)
  - JavaScript code (creates enqueueJs step)
  - Plugin/Theme URLs (creates installPlugin/installTheme steps)
  - WordPress admin URLs (creates setLandingPage step)

Examples:
  echo "<?php echo 'Hello';" | playground-paste -p
  echo "https://wordpress.org/plugins/akismet/" | playground-paste
  echo "wp plugin activate akismet" | playground-paste
  playground-paste blueprint.json -o steps.json
`);
}
function parseArgs(args) {
  const options = {
    input: null,
    output: null,
    pretty: false,
    typeOnly: false,
    help: false
  };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case "-h":
      case "--help":
        options.help = true;
        break;
      case "-o":
      case "--output":
        options.output = args[++i];
        break;
      case "-p":
      case "--pretty":
        options.pretty = true;
        break;
      case "-t":
      case "--type":
        options.typeOnly = true;
        break;
      default:
        if (!arg.startsWith("-") && !options.input) {
          options.input = arg;
        }
        break;
    }
  }
  return options;
}
async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);
  if (options.help) {
    showHelp();
    process.exit(0);
  }
  let input;
  try {
    if (options.input) {
      if (options.input === "-") {
        input = fs.readFileSync(0, "utf8");
      } else {
        const inputPath = path.resolve(options.input);
        if (!fs.existsSync(inputPath)) {
          console.error(`Error: Input file does not exist: ${inputPath}`);
          process.exit(1);
        }
        input = fs.readFileSync(inputPath, "utf8");
      }
    } else {
      if (process.stdin.isTTY) {
        console.error("Error: No input provided. Use --help for usage information.");
        process.exit(1);
      }
      input = fs.readFileSync(0, "utf8");
    }
  } catch (error) {
    console.error(`Error reading input: ${error.message}`);
    process.exit(1);
  }
  if (!input || !input.trim()) {
    console.error("Error: Empty input");
    process.exit(1);
  }
  if (options.typeOnly) {
    const contentType = detectContentType(input);
    if (contentType) {
      console.log(contentType);
    } else {
      console.error("Unable to detect content type");
      process.exit(1);
    }
    process.exit(0);
  }
  const result = processPaste(input);
  if (!result) {
    console.error("Unable to detect content type or process input");
    process.exit(1);
  }
  const jsonOutput = options.pretty ? JSON.stringify(result, null, 2) : JSON.stringify(result);
  if (options.output) {
    try {
      fs.writeFileSync(path.resolve(options.output), jsonOutput);
      console.error(`Output written to: ${options.output}`);
    } catch (error) {
      console.error(`Error writing output file: ${error.message}`);
      process.exit(1);
    }
  } else {
    console.log(jsonOutput);
  }
}
process.on("uncaughtException", (error) => {
  console.error(`Uncaught error: ${error.message}`);
  process.exit(1);
});
main();
