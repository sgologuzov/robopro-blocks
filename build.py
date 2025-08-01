#!/usr/bin/python2.7
# Compresses the core Blockly files into a single JavaScript file.
#
# Copyright 2012 Google Inc.
# https://developers.google.com/blockly/
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# This script generates two versions of Blockly's core files:
#   blockly_compressed.js
#   blockly_uncompressed.js
# The compressed file is a concatenation of all of Blockly's core files which
# have been run through Google's Closure Compiler.  This is done using the
# online API (which takes a few seconds and requires an Internet connection).
# The uncompressed file is a script that loads in each of Blockly's core files
# one by one.  This takes much longer for a browser to load, but is useful
# when debugging code since line numbers are meaningful and variables haven't
# been renamed.  The uncompressed file also allows for a faster developement
# cycle since there is no need to rebuild or recompile, just reload.
#
# This script also generates:
#   blocks_compressed.js: The compressed common blocks.
#   blocks_horizontal_compressed.js: The compressed Scratch horizontal blocks.
#   blocks_vertical_compressed.js: The compressed Scratch vertical blocks.
#   msg/js/<LANG>.js for every language <LANG> defined in msg/js/<LANG>.json.

import sys

import errno, glob, json, os, re, subprocess, threading, codecs, functools

if sys.version_info[0] == 2:
  import httplib
  from urllib import urlencode
else:
  import http.client as httplib
  from urllib.parse import urlencode
  from importlib import reload

REMOTE_COMPILER = "remote"

CLOSURE_DIR = os.path.pardir
CLOSURE_ROOT = os.path.pardir
CLOSURE_LIBRARY = "closure-library"
CLOSURE_COMPILER = REMOTE_COMPILER

CLOSURE_DIR_NPM = "node_modules"
CLOSURE_ROOT_NPM = os.path.join("node_modules")
CLOSURE_LIBRARY_NPM = "google-closure-library"
CLOSURE_COMPILER_NPM = ("google-closure-compiler.cmd" if os.name == "nt" else "google-closure-compiler")

def import_path(fullpath):
  """Import a file with full path specification.
  Allows one to import from any directory, something __import__ does not do.

  Args:
      fullpath:  Path and filename of import.

  Returns:
      An imported module.
  """
  path, filename = os.path.split(fullpath)
  filename, ext = os.path.splitext(filename)
  sys.path.append(path)
  module = __import__(filename)
  reload(module)  # Might be out of date.
  del sys.path[-1]
  return module

def read(filename):
    f = open(filename)
    content = "".join(f.readlines())
    f.close()
    return content

HEADER = ("// Do not edit this file; automatically generated by build.py.\n"
          "'use strict';\n")


class Gen_uncompressed(threading.Thread):
  """Generate a JavaScript file that loads Blockly's raw files.
  Runs in a separate thread.
  """
  def __init__(self, search_paths, vertical, closure_env):
    threading.Thread.__init__(self)
    self.search_paths = search_paths
    self.vertical = vertical
    self.closure_env = closure_env

  def run(self):
    if self.vertical:
      target_filename = 'blockly_uncompressed_vertical.js'
    else:
      target_filename = 'blockly_uncompressed_horizontal.js'
    f = open(target_filename, 'w')
    f.write(HEADER)
    f.write(self.format_js("""
var isNodeJS = !!(typeof module !== 'undefined' && module.exports &&
                  typeof window === 'undefined');

if (isNodeJS) {
  var window = {};
  require('{closure_library}');
}

window.BLOCKLY_DIR = (function() {
  if (!isNodeJS) {
    // Find name of current directory.
    var scripts = document.getElementsByTagName('script');
    var re = new RegExp('(.+)[\/]blockly_uncompressed(_vertical|_horizontal|)\.js$');
    for (var i = 0, script; script = scripts[i]; i++) {
      var match = re.exec(script.src);
      if (match) {
        return match[1];
      }
    }
    alert('Could not detect Blockly\\'s directory name.');
  }
  return '';
})();

window.BLOCKLY_BOOT = function() {
  var dir = '';
  if (isNodeJS) {
    require('{closure_library}');
    dir = 'blockly';
  } else {
    // Execute after Closure has loaded.
    if (!window.goog) {
      alert('Error: Closure not found.  Read this:\\n' +
            'developers.google.com/blockly/guides/modify/web/closure');
    }
    if (window.BLOCKLY_DIR.search(/node_modules/)) {
      dir = '..';
    } else {
      dir = window.BLOCKLY_DIR.match(/[^\\/]+$/)[0];
    }
  }
"""))
    add_dependency = []
    base_path = calcdeps.FindClosureBasePath(self.search_paths)
    for dep in calcdeps.BuildDependenciesFromFiles(self.search_paths):
      add_dependency.append(calcdeps.GetDepsLine(dep, base_path))
    add_dependency.sort()  # Deterministic build.
    add_dependency = '\n'.join(add_dependency)
    # Find the Blockly directory name and replace it with a JS variable.
    # This allows blockly_uncompressed.js to be compiled on one computer and be
    # used on another, even if the directory name differs.
    m = re.search('[\\/]([^\\/]+)[\\/]core[\\/]blockly.js', add_dependency)
    add_dependency = re.sub('([\\/])' + re.escape(m.group(1)) +
        '([\\/]core[\\/])', '\\1" + dir + "\\2', add_dependency)
    f.write(add_dependency + '\n')

    provides = []
    for dep in calcdeps.BuildDependenciesFromFiles(self.search_paths):
      # starts with '../' or 'node_modules/'
      if not dep.filename.startswith(self.closure_env["closure_root"] + os.sep):
        provides.extend(dep.provides)
    provides.sort()  # Deterministic build.
    f.write('\n')
    f.write('// Load Blockly.\n')
    for provide in provides:
      f.write("goog.require('%s');\n" % provide)

    f.write(self.format_js("""
delete this.BLOCKLY_DIR;
delete this.BLOCKLY_BOOT;
};

if (isNodeJS) {
  window.BLOCKLY_BOOT();
  module.exports = Blockly;
} else {
  // Delete any existing Closure (e.g. Soy's nogoog_shim).
  document.write('<script>var goog = undefined;</script>');
  // Load fresh Closure Library.
  document.write('<script src="' + window.BLOCKLY_DIR +
      '/{closure_dir}/{closure_library}/closure/goog/base.js"></script>');
  document.write('<script>window.BLOCKLY_BOOT();</script>');
}
"""))
    f.close()
    print("SUCCESS: " + target_filename)

  def format_js(self, code):
    """Format JS in a way that python's format method can work with to not
    consider brace-wrapped sections to be format replacements while still
    replacing known keys.
    """

    key_whitelist = self.closure_env.keys()

    keys_pipe_separated = functools.reduce(lambda accum, key: accum + "|" + key, key_whitelist)
    begin_brace = re.compile(r"\{(?!%s)" % (keys_pipe_separated,))

    end_brace = re.compile(r"\}")
    def end_replacement(match):
      try:
        maybe_key = match.string[match.string[:match.start()].rindex("{") + 1:match.start()]
      except ValueError:
        return "}}"

      if maybe_key and maybe_key in key_whitelist:
        return "}"
      else:
        return "}}"

    return begin_brace.sub("{{", end_brace.sub(end_replacement, code)).format(**self.closure_env)

class Gen_compressed(threading.Thread):
  """Generate a JavaScript file that contains all of Blockly's core and all
  required parts of Closure, compiled together.
  Uses the Closure Compiler's online API.
  Runs in a separate thread.
  """
  def __init__(self, search_paths_vertical, search_paths_horizontal, closure_env):
    threading.Thread.__init__(self)
    self.search_paths_vertical = search_paths_vertical
    self.search_paths_horizontal = search_paths_horizontal
    self.closure_env = closure_env

  def run(self):
    self.gen_core(True)
    self.gen_core(False)
    self.gen_blocks("horizontal")
    self.gen_blocks("vertical")
    self.gen_blocks("common")
    self.gen_generator("arduino")
    self.gen_generator("python")

  def gen_core(self, vertical):
    if vertical:
      target_filename = 'blockly_compressed_vertical.js'
      search_paths = self.search_paths_vertical
    else:
      target_filename = 'blockly_compressed_horizontal.js'
      search_paths = self.search_paths_horizontal
    # Define the parameters for the POST request.
    params = [
      ("compilation_level", "SIMPLE"),

      # remote will filter this out
      ("language_in", "ECMASCRIPT_2017"),
      ("language_out", "ECMASCRIPT5"),
      ("rewrite_polyfills", "false"),
      ("define", "goog.DEBUG=false"),

      # local will filter this out
      ("use_closure_library", "true"),
    ]

    # Read in all the source files.
    filenames = calcdeps.CalculateDependencies(search_paths,
      [os.path.join("core", "blockly.js")])
    filenames.sort()  # Deterministic build.
    for filename in filenames:
      # Append filenames as false arguments the step before compiling will
      # either transform them into arguments for local or remote compilation
      params.append(("js_file", filename))

    self.do_compile(params, target_filename, filenames, "")

  def gen_blocks(self, block_type):
    if block_type == "horizontal":
      target_filename = "blocks_compressed_horizontal.js"
      filenames = glob.glob(os.path.join("blocks_horizontal", "*.js"))
    elif block_type == "vertical":
      target_filename = "blocks_compressed_vertical.js"
      filenames = glob.glob(os.path.join("blocks_vertical", "*.js"))
    elif block_type == "common":
      target_filename = "blocks_compressed.js"
      filenames = glob.glob(os.path.join("blocks_common", "*.js"))

    # glob.glob ordering is platform-dependent and not necessary deterministic
    filenames.sort()  # Deterministic build.

    # Define the parameters for the POST request.
    params = [
      ("compilation_level", "SIMPLE"),
    ]

    # Read in all the source files.
    # Add Blockly.Blocks to be compatible with the compiler.
    params.append(("js_file", os.path.join("build", "gen_blocks.js")))
    # Add Blockly.Colours for use of centralized colour bank
    filenames.append(os.path.join("core", "colours.js"))
    filenames.append(os.path.join("core", "constants.js"))

    for filename in filenames:
      # Append filenames as false arguments the step before compiling will
      # either transform them into arguments for local or remote compilation
      params.append(("js_file", filename))

    # Remove Blockly.Blocks to be compatible with Blockly.
    remove = "var Blockly={Blocks:{}};"
    self.do_compile(params, target_filename, filenames, remove)

  def gen_generator(self, language):
    target_filename = language + "_compressed.js"
    # Define the parameters for the POST request.
    params = [
        ("compilation_level", "SIMPLE_OPTIMIZATIONS"),
      ]

    # Read in all the source files.
    # Add Blockly.Generator to be compatible with the compiler.
    params.append(("js_file", os.path.join("build", "gen_language.js")))

    filenames = glob.glob(
        os.path.join("generators", language, "*.js"))
    filenames.insert(0, os.path.join("generators", language + ".js"))
    for filename in filenames:
      params.append(("js_file", filename))
    filenames.insert(0, "[goog.provide]")

    # Remove Blockly.Generator to be compatible with Blockly.
    remove = "var Blockly={Generator:{}};"
    self.do_compile(params, target_filename, filenames, remove)

  def do_compile(self, params, target_filename, filenames, remove):
    if self.closure_env["closure_compiler"] == REMOTE_COMPILER:
      do_compile = self.do_compile_remote
    else:
      do_compile = self.do_compile_local
    json_data = do_compile(params, target_filename)

    if self.report_errors(target_filename, filenames, json_data):
      self.write_output(target_filename, remove, json_data)
      self.report_stats(target_filename, json_data)

  def do_compile_local(self, params, target_filename):
      filter_keys = ["use_closure_library"]

      # Drop arg if arg is js_file else add dashes
      dash_params = []
      for (arg, value) in params:
        dash_params.append((value,) if arg == "js_file" else ("--" + arg, value))

      # Flatten dash_params into dash_args if their keys are not in filter_keys
      dash_args = []
      for pair in dash_params:
        if pair[0][2:] not in filter_keys:
          dash_args.extend(pair)

      # Build the final args array by prepending CLOSURE_COMPILER_NPM to
      # dash_args and dropping any falsy members
      # Use a flagfile into the closure compiler.To fix the compilation problems due to commands exceeding 8191 characters in Windows Environment.
      if(os.name == "nt"):
        tmp_data = " ".join(dash_args)
        tmp_data_list = list(tmp_data)
        n_pos = [i for i, x in enumerate(tmp_data_list) if x == "\\"]
        for x in range(len(n_pos)):
          tmp_data_list.insert(n_pos[len(n_pos) - x - 1], "\\")
        tmp_data = "".join(tmp_data_list)

        f_name = target_filename + ".config"
        temp_f = open(f_name, "w")
        temp_f.write(tmp_data)
        temp_f.close()

        args = [closure_compiler, "--flagfile", f_name]

        proc = subprocess.Popen(args, stdin=subprocess.PIPE, stdout=subprocess.PIPE, shell=True)
      else:
        args = []
        for group in [[CLOSURE_COMPILER_NPM], dash_args]:
          args.extend(filter(lambda item: item, group))

          proc = subprocess.Popen(args, stdin=subprocess.PIPE, stdout=subprocess.PIPE)

      (stdout, stderr) = proc.communicate()

      # Build the JSON response.
      filesizes = [os.path.getsize(value) for (arg, value) in params if arg == "js_file"]
      return dict(
        compiledCode=stdout,
        statistics=dict(
          originalSize=functools.reduce(lambda v, size: v + size, filesizes, 0),
          compressedSize=len(stdout),
        )
      )

  def do_compile_remote(self, params, target_filename):
      filter_keys = [
        "language_in",
        "language_out",
        "rewrite_polyfills",
        "define",
      ]

      params.extend([
        ("output_format", "json"),
        ("output_info", "compiled_code"),
        ("output_info", "warnings"),
        ("output_info", "errors"),
        ("output_info", "statistics"),
      ])

      # Send the request to Google.
      remoteParams = []
      for (arg, value) in params:
        if not arg in filter_keys:
          if arg == "js_file":
            if not value.startswith(self.closure_env["closure_root"] + os.sep):
              remoteParams.append(("js_code", read(value)))
          # Change the normal compilation_level value SIMPLE to the remove
          # service's SIMPLE_OPTIMIZATIONS
          elif arg == "compilation_level" and value == "SIMPLE":
            remoteParams.append((arg, "SIMPLE_OPTIMIZATIONS"))
          else:
            remoteParams.append((arg, value))

      headers = {"Content-type": "application/x-www-form-urlencoded"}
      conn = httplib.HTTPSConnection("closure-compiler.appspot.com")
      conn.request("POST", "/compile", urlencode(remoteParams), headers)
      response = conn.getresponse()
      # Decode is necessary for Python 3.4 compatibility
      json_str = response.read().decode("utf-8")
      conn.close()

      # Parse the JSON response.
      return json.loads(json_str)

  def report_errors(self, target_filename, filenames, json_data):
    def file_lookup(name):
      if not name.startswith("Input_"):
        return "???"
      n = int(name[6:]) - 1
      return filenames[n]

    if "serverErrors" in json_data:
      errors = json_data["serverErrors"]
      for error in errors:
        print("SERVER ERROR: %s" % target_filename)
        print(error["error"])
    elif "errors" in json_data:
      errors = json_data["errors"]
      for error in errors:
        print("FATAL ERROR")
        print(error["error"])
        if error["file"]:
          print("%s at line %d:" % (
              file_lookup(error["file"]), error["lineno"]))
          print(error["line"])
          print((" " * error["charno"]) + "^")
        sys.exit(1)
    else:
      if "warnings" in json_data:
        warnings = json_data["warnings"]
        for warning in warnings:
          print("WARNING")
          print(warning["warning"])
          if warning["file"]:
            print("%s at line %d:" % (
                file_lookup(warning["file"]), warning["lineno"]))
            print(warning["line"])
            print((" " * warning["charno"]) + "^")
        print()

      return True

    return False

  def write_output(self, target_filename, remove, json_data):
      if "compiledCode" not in json_data:
        print("FATAL ERROR: Compiler did not return compiledCode.")
        sys.exit(1)

      compiledCode = json_data["compiledCode"].decode("utf-8")

      if (compiledCode.find("new Blockly.Generator") != -1):
        code = HEADER + "\nlet Blockly = require(\'robopro-blocks\');\n\n" + compiledCode
      else:
        code = HEADER + "\n" + compiledCode

      code = code.replace(remove, "")

      # Trim down Google's (and only Google's) Apache licences.
      # The Closure Compiler preserves these.
      LICENSE = re.compile("""/\\*

 [\w ]+

 Copyright \\d+ Google Inc.
 https://developers.google.com/blockly/

 Licensed under the Apache License, Version 2.0 \(the "License"\);
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
\\*/""")
      code = re.sub(LICENSE, "", code)

      stats = json_data["statistics"]
      original_b = stats["originalSize"]
      compressed_b = stats["compressedSize"]
      if original_b > 0 and compressed_b > 0:
        f = open(target_filename, "w")
        f.write(code)
        f.close()

  def report_stats(self, target_filename, json_data):
      stats = json_data["statistics"]
      original_b = stats["originalSize"]
      compressed_b = stats["compressedSize"]
      if original_b > 0 and compressed_b > 0:
        original_kb = int(original_b / 1024 + 0.5)
        compressed_kb = int(compressed_b / 1024 + 0.5)
        ratio = int(float(compressed_b) / float(original_b) * 100 + 0.5)
        print("SUCCESS: " + target_filename)
        print("Size changed from %d KB to %d KB (%d%%)." % (
            original_kb, compressed_kb, ratio))
        if(os.name == "nt"):
          os.remove(target_filename + ".config")
      else:
        print("UNKNOWN ERROR")


class Gen_langfiles(threading.Thread):
  """Generate JavaScript file for each natural language supported.

  Runs in a separate thread.
  """

  def __init__(self):
    threading.Thread.__init__(self)

  def _rebuild(self, srcs, dests):
    # Determine whether any of the files in srcs is newer than any in dests.
    try:
      return (max(os.path.getmtime(src) for src in srcs) >
              min(os.path.getmtime(dest) for dest in dests))
    except OSError as e:
      # Was a file not found?
      if e.errno == errno.ENOENT:
        # If it was a source file, we can't proceed.
        if e.filename in srcs:
          print("Source file missing: " + e.filename)
          sys.exit(1)
        else:
          # If a destination file was missing, rebuild.
          return True
      else:
        print("Error checking file creation times: " + str(e))

  def run(self):
    # The files msg/json/{en,qqq,synonyms}.json depend on msg/messages.js.
    if self._rebuild([os.path.join("msg", "messages.js")],
                     [os.path.join("msg", "json", f) for f in
                      ["en.json", "qqq.json", "synonyms.json"]]):
      try:
        subprocess.check_call([
            "python",
            os.path.join("i18n", "js_to_json.py"),
            "--input_file", "msg/messages.js",
            "--output_dir", "msg/json/",
            "--quiet"])
      except (subprocess.CalledProcessError, OSError) as e:
        # Documentation for subprocess.check_call says that CalledProcessError
        # will be raised on failure, but I found that OSError is also possible.
        print("Error running i18n/js_to_json.py: ", e)
        sys.exit(1)

    # Checking whether it is necessary to rebuild the js files would be a lot of
    # work since we would have to compare each <lang>.json file with each
    # <lang>.js file.  Rebuilding is easy and cheap, so just go ahead and do it.
    try:
      # Use create_messages.py to create .js files from .json files.
      cmd = [
          "python",
          os.path.join("i18n", "create_messages.py"),
          "--source_lang_file", os.path.join("msg", "json", "en.json"),
          "--source_synonym_file", os.path.join("msg", "json", "synonyms.json"),
          "--source_constants_file", os.path.join("msg", "json", "constants.json"),
          "--key_file", os.path.join("msg", "json", "keys.json"),
          "--output_dir", os.path.join("msg", "js"),
          "--quiet"]
      json_files = glob.glob(os.path.join("msg", "json", "*.json"))
      json_files = [file for file in json_files if not
                    (file.endswith(("keys.json", "synonyms.json", "qqq.json", "constants.json")))]
      cmd.extend(json_files)
      subprocess.check_call(cmd)
    except (subprocess.CalledProcessError, OSError) as e:
      print("Error running i18n/create_messages.py: ", e)
      sys.exit(1)

    # Output list of .js files created.
    for f in json_files:
      # This assumes the path to the current directory does not contain "json".
      f = f.replace("json", "js")
      if os.path.isfile(f):
        print("SUCCESS: " + f)
      else:
        print("FAILED to create " + f)

def exclude_vertical(item):
  return not item.endswith("block_render_svg_vertical.js")

def exclude_horizontal(item):
  return not item.endswith("block_render_svg_horizontal.js")

if __name__ == "__main__":
  try:
    closure_dir = CLOSURE_DIR_NPM
    closure_root = CLOSURE_ROOT_NPM
    closure_library = CLOSURE_LIBRARY_NPM
    closure_compiler = CLOSURE_COMPILER_NPM

    # Load calcdeps from the local library
    calcdeps = import_path(os.path.join(
        closure_root, closure_library, "closure", "bin", "calcdeps.py"))

    # Sanity check the local compiler
    test_args = [closure_compiler, os.path.join("build", "test_input.js")]
    if(os.name == "nt"):
      test_proc = subprocess.Popen(test_args, stdin=subprocess.PIPE, stdout=subprocess.PIPE, shell=True)
    else:
      test_proc = subprocess.Popen(test_args, stdin=subprocess.PIPE, stdout=subprocess.PIPE)
    (stdout, _) = test_proc.communicate()
    assert stdout.decode("utf-8") == read(os.path.join("build", "test_expect.js"))

    print("Using local compiler: %s ...\n" % CLOSURE_COMPILER_NPM)
  except (ImportError, AssertionError):
    print("Using remote compiler: closure-compiler.appspot.com ...\n")

    try:
      closure_dir = CLOSURE_DIR
      closure_root = CLOSURE_ROOT
      closure_library = CLOSURE_LIBRARY
      closure_compiler = CLOSURE_COMPILER

      calcdeps = import_path(os.path.join(
          closure_root, closure_library, "closure", "bin", "calcdeps.py"))
    except ImportError:
      if os.path.isdir(os.path.join(os.path.pardir, "closure-library-read-only")):
        # Dir got renamed when Closure moved from Google Code to GitHub in 2014.
        print("Error: Closure directory needs to be renamed from"
              "'closure-library-read-only' to 'closure-library'.\n"
              "Please rename this directory.")
      elif os.path.isdir(os.path.join(os.path.pardir, "google-closure-library")):
        print("Error: Closure directory needs to be renamed from"
             "'google-closure-library' to 'closure-library'.\n"
             "Please rename this directory.")
      else:
        print("""Error: Closure not found.  Read this:
  developers.google.com/blockly/guides/modify/web/closure""")
      sys.exit(1)

  search_paths = list(calcdeps.ExpandDirectories(
      ["core", os.path.join(closure_root, closure_library)]))

  search_paths_horizontal = list(filter(exclude_vertical, search_paths))
  search_paths_vertical = list(filter(exclude_horizontal, search_paths))

  closure_env = {
    "closure_dir": closure_dir,
    "closure_root": closure_root,
    "closure_library": closure_library,
    "closure_compiler": closure_compiler,
  }

  # Run all tasks in parallel threads.
  # Uncompressed is limited by processor speed.
  # Compressed is limited by network and server speed.
  # Vertical:
  Gen_uncompressed(search_paths_vertical, True, closure_env).start()
  # Horizontal:
  Gen_uncompressed(search_paths_horizontal, False, closure_env).start()

  # Compressed forms of vertical and horizontal.
  Gen_compressed(search_paths_vertical, search_paths_horizontal, closure_env).start()

  # This is run locally in a separate thread.
  # Gen_langfiles().start()
