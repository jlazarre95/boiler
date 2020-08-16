# How Boiler Works

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
```javascript
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