# Boiler

The generic, extensible boilerplate code generator.

## Use-case

`boiler` will be useful for you if you find yourself repeatedly writing the same 
mundane code over and over. It is also useful if you wish to create projects from
scratch without having to remember all the setup involved for each project type.

## Installation

Prequisities:

* [NPM](https://www.npmjs.com/get-npm)

Run the following command to install `boiler` globally on your system:

```sh
npm install -g boiler
```

Ensure that `BOILER_PATH` is set to a valid directory path. This is where many
boiler-related files will be stored.

## Quick Start

```sh
# Print help docs
boiler help

# Print BOILER_PATH
boiler path

# Download Git repo as spring-boot package
boiler install https://github.com/boiler/spring-boot-boiler.git spring-boot

# List all packages
boiler ls -a

# Print spring-boot package info
boiler ls -g spring-boot

# Create a Spring Boot project
boiler generate -g spring-boot project my-app

cd my-app
```

## API Reference (not all supported yet)

```sh
boiler path
boiler init
boiler new package <package>
boiler new script [<package>] <script> 
boiler new template [<package>] <template>
boiler link [<package-path>]
boiler ls [-a|-g]
boiler ls [-g] <package> 
boiler open [-g] <package>
boiler search [<package>]
boiler install [-g] <location> <package> 
boiler publish [-g] <package>
boiler get [-f] <global-package> [<local-package>]
boiler put [-f] <local-package> [<global-package>]
boiler cp [-g|-f] <orig-package> [<new-package>]
boiler rm [-g] <package>
boiler generate [-g|(-f|--force)] <package> <template> [...<args>]
boiler templatize [-g] <package>
```

## Resources

Refer to the following extra resources for more information about `boiler`:

* [How boiler works](docs/how-it-works.md)
* [How to create your own boilerplate](docs/byob.md)
* [Package configuration schema documentation](docs/package-config-schema.md)
