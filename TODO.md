- Test bin scripts
- go through all package config logic and ensure null-checks
- add display name to params for displaying on prompts
- add virtual property to PackageConfigParam and check it in ParamResolver
- check for quotes in args
- pre-fetch all required args in template tree before calling paramResolver in
BoilerplateGenerator
- when loading packageconfig, remove template extension from all included files