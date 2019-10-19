# Boiler

The generic, extensible boilerplate code generator.

## Use-case

Boiler will be useful for you if you find yourself repeatedly writing the same 
mundane code over and over. It is also useful if you wish to create projects from
scratch without having to remember all the setup involved for each project type.

## Installation

```sh
npm install -g boiler
```

Ensure that `BOILER_PATH` is set to a valid directory path. This is where many
boiler-related files will be stored.

## Quick Start

```sh
# Print BOILER_PATH
boiler path

# Download Git repo as spring-boot package
boiler pull https://github.com/boiler/boiler-java-gradle-spring-boot.git spring-boot

# List all packages
boiler ls -a

# Print spring-boot package info
boiler ls -g spring-boot

# Create a Spring Boot project
boiler generate -g spring-boot project my-app

cd my-app
```

## How It Works


A `package` is a self-contained collection of Boiler-related files (e.g., templates,
scripts) for generating boilerplate code. Packages are they heart and soul of 
boiler. 

Usually, a package generates code for a specific kind of project or task. For 
example, a package may produce Java 12 code while another produces Angular 8 
Typescript code.

Every package has a `boiler.json` file that contains the package configuration. 
This configuration file defines all the templates, scripts, and other boilerplate 
configuration that belong to the package. This is an example configuration:

**boiler.json**
```json
{
	"params": [
		{
			"name": "name",
			"type": "positional"
		},
	],
	"templates": [
        {
            "name": "hello",
            "include": "hello.txt.boiler"
        }
    ],
	"output": {
		"file": {
			"prefix": "{{pascalcase-class}}",
			"replace": [
				{
					"target": "\\.boiler$",
					"with": ""
				}
			]
		}
	}
}
```

A typical package structure looks like the following:

```
boiler.json
templates/
    template-1.txt.boiler
    template-2.txt.boiler
scripts/
    before.js
```

Packages can be uploaded to and downloaded from the web.

A `template` is a boilerplate generator. It defines a collection of
`template files` that will be generated as the boilerplate code. A template file
contains sample boilerplate code, but the dynamic parts are surrounded with double
curly braces so that they can be replaced with relevant values later -- these are 
called `params`.

Below is a simple template file. Note the file name is suffixed with `.boiler`, 
which is the extension of all template files:

**hello.txt.boiler**
```
Hello {{name}}!
```

When the `name` param is provided to the template, it will replace `{{name}}` with
the value of the param. For example, if `name` is `John Doe`, the produced output
will be:

**hello.txt**
```
Hello John Doe!
```

Note the name of the output file is the same as the template file but with the `.boiler` extension removed.

If a template requires params that the user does not provide, a `prompt` will ask
the user to provide the missing param values.

A `script` is custom-defined executable code that runs to support boilerplate code
generation. For example, if one needs to run a third-party command line tool to 
perform set up for generating the code (like project scaffolding), this is where
scripts come in to help.

Scripts can show prompts to request the user for more information if necessary.

## Bring Your Own Boilerplate

Boiler is extensible, meaning you can create a boilerplate generator that meets your
organization's or project's needs. If you haven't already, refer to the 
`How It Works` section to have a understanding of basic boiler concepts.

(coming soon)

## API (not all supported yet)

```sh
boiler path
boiler init
boiler new package <package>
boiler new script [<package>] <script> 
boiler new template [<package>] <template>
boiler ls [-a|-g]
boiler ls [-g] <package> 
boiler open [-g] <package>
boiler search [<package>]
boiler pull [-g] <location> <package> 
boiler push [-g] <package>
boiler get [-f] <global-package> [<local-package>]
boiler put [-f] <local-package> [<global-package>]
boiler cp [-g|-f] <orig-package> [<new-package>]
boiler rm [-g] <package>
boiler generate [-g|(-f|--force)] <package> <template> [...<args>]
boiler templatize [-g] <package>
```