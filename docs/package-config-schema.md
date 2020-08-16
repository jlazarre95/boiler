# Package Configuration Schema

Every package configuration (e.g. `boiler.json`) must conform to the specified
schema. Below, you'll find a specification for creating a package configuration in
`boiler`.


This is the root of the package configuration file:

| name              | type      | required  | default | description                                                                                                                                                 |
| ----------------- | --------- | --------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **params**        | `array`  	| ✖️        | `N/A`   | List of [params](#params)  |
| **templates**   	| `array`  	| ✖️        | `N/A`   | List of [templates](#templates) |
| **output**   		| `object`  | ✖️        | `N/A`   | An [output](#output) object |

```js
{
	"params": [],
	"templates": [],
	"output": {}
}
```

---

## params

An array of parameters that any template can require.

###

| name              | type      | required  | default | description                                                                                                                                                 |
| ----------------- | --------- | --------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **type**          | `string`  | ✔️        | `N/A`   | Type of the parameter. Must be one the following: [`"positional"`, `"flag"`, `"optional"`, `"virtual"`]. Positional parameters take no arguments and are not prefixed. Only one positional parameter can be used in a template. Flag parameters take no arguments but are prefixed with `--`. They act as a boolean value or switch. Optional parameters take a single argument and are prefixed with `--`. Virtual parameters cannot be explicitly set through the command line but are implicitly set using some other means such as a script.  |
| **name**   		| `string`  | ✔️        | `N/A`   | Name of the parameter. It is typically all lowercase and hypenated with no whitespace.                                                                      |
| **displayName**   | `string`  | ✖️        | `N/A`   | Human-readable name of the parameter that is displayed on the console. Whitespace is encouraged.       														|
| **description**   | `string`  | ✖️        | `N/A`   | Description of the parameter                                                                                        |
| **defaultValue**  | `string`  | ✖️        | `N/A`   | Default value of the parameter if a value is not given. Can be overidden via the command line. Flags and virtual parameters do not support default values. Flags are implicitly "false" by default.                                                                                 |
| **script**        | `string`  | ✖️        | `N/A`   | Inline Javascript code for setting a value for the virtual parameter. `type` must be set to `virtual`.                                                                                        |

```js
"params": [
	// Positional
	{
		"type": "positional",
		"name": "class-name",
		"displayName": "Class name",
		"description": "Name of the class you wish to create"
	},
	// Flag
	{
		"type": "flag",
		"name": "getters-and-setters",
		"displayName": "Getters and setters",
		"description": "Name of the class you wish to create"
	},
	// Optional
	{
		"type": "optional",
		"name": "package",
		"description": "Fully-qualified name of the package to create the class in",
		"defaultValue": "com.mycompany.mypackage"
	},
	// Virtual
	{
		"type": "virtual",
		"name": "package-path",
		"script": "return boiler.params.package.replace(new RegExp('.', 'g'), '/')", // replace '.' with '/'
	},
]
```

---

## templates

An array of templates that can be used to generate boilerplate code.


| name              | type      			| required  | default | description                                                                                                                                                 |
| ----------------- | --------------------- | --------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **name**          | `string`  			| ✔️        | `N/A`   | Name of the template.  |
| **include**   	| `string` or `array`	| ✔️       	| `N/A`   | Template files to output as generated boilerplate. Can be a single filename as a `string` or an `array` of files. Each file in the `array` can be a filename as a `string` or an [Include](#1-include) object.  |
| **require**   	| `array`  				| ✖️        | `N/A`   | Parameters that the template requires. Each parameter can be `string` or a [Require](#2-require) object. |
| **outDir**   		| `string`				| ✖️        | `N/A`   | Description of the parameter. Param syntax is supported. |


```js
"templates": [
	{
		"name": "class",
		"require": [
			"class-name",
			"getters-and-setters",
			"package",
			"package-path"
		],
		"include": [
			{
				"name": "MyClass.java.boiler",
				"outDir": "src/java/main/{{package-path}}"			
			},
			{
				"name": "MyClassTests.java.boiler",
				"outDir": "src/java/test/{{package-path}}"
			}
		],
	}
]
```

### Additional Schemas

#### 1. Include

| name              | type      			| required  | default | description                                                                                                                                                 |
| ----------------- | --------------------- | --------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **name**          | `string`  			| ✔️        | `N/A`   | Name of the template file |
| **outDir**   		| `string`				| ✖️        | `N/A`   | Directory to generate output file |

#### 2. Require

| name              | type      | required  | default | description                                                                                                                                                 |
| ----------------- | --------- | --------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **type**          | `string`  | ✔️        | `N/A`   | Refer to [params](#params)  |
| **name**   		| `string`  | ✔️        | `N/A`   | Refer to [params](#params)  |
| **displayName**   | `string`  | ✖️        | `N/A`   | Refer to [params](#params)  |
| **description**   | `string`  | ✖️        | `N/A`   | Refer to [params](#params)  |
| **defaultValue**  | `string`  | ✖️        | `N/A`   | Refer to [params](#params)  |
| **script**        | `string`  | ✖️        | `N/A`   | Refer to [params](#params)  |                                                                                      |

---

## output

An object for configuring the output of every template.

###

| name              | type      | required  | default | description                                                                                                                                                 |
| ----------------- | --------- | --------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **file**          | `object`  | ✖️        | `N/A`   | A [file](#outputfile) object  |

```js
"output": 
	"file": { }
```
---

## output.file

An object for manipulating output files such as filenames.

###

| name              | type      | required  | default | description                                                                                                                                                 |
| ----------------- | --------- | --------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **replace**       | `array`  	| ✖️      	| `N/A`   | A list of [replaces](#outputfilereplace) |

```js
"file": 
	"replace": []
```
---

## output.file.replace

An array of replace commands for manipulating filenames.

###

| name              | type      | required  | default | description                                                                                                                                                 |
| ----------------- | --------- | --------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **target**       	| `string`  | ✔️      	| `N/A`   | The substring to replace or the regular expression that matches the substring to replace. |
| **with**       	| `string`  | ✔️      	| `N/A`   | The text to replace the target with. Param syntax is supported.|

```js
"replace": [
	{
		"target": "\\.boiler$",	// regular expression
		"with": ""
	},
	{
		"target": "{{ClassName}}",	// finds the literal string "{{ClassName}}" - won't be evaluated.
		"with": "{{pascalcase-class-name}}" // this param syntax, however, will be evaluated.
	}
]
```