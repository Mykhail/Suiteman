# Suiteman (BETA)

Suiteman is a simple tool created to automate customization process of Suite Commerce Advanced applications.

Different types of files and resources in SuiteCommerce have different recommended best practices.
Therefore, choosing the right one might be confusing for newcomers. Moreover, even seasoned SCA veterans sometimes forget about companys' naming conventions and get annoyed while doing all requred copy/paste file manipulations.

Suiteman analyzes file path and creates all customization files in accordance with NetSuite <a href="https://developers.suitecommerce.com/section4501068327">best practices</a> and naming conventions.
In addition, it automatically adds all required dependencies to an appropriate object in distro.json file.

## Demo
<p align="center">
  <img src="https://github.com/Mykhail/Suiteman/raw/master/img/demo.gif" width="70%" alt="Suiteman's demo"/>
</p>

## Installation

To make Suiteman available to run across all of your SCA projects, we recommend installing it globally. You can do so using npm:

```
$ npm install suiteman -g
```


After that, you can run Suiteman on any SCA applications. Just run it from the root folder of Suite Commerce Advanced application :

```
$ suiteman -c PATH_TO_FILE

Example: suiteman -c Account@2.1.0/JavaScript/Account.Login.Model.js

```

## Configuration

Naming conventions from <a href="https://developers.suitecommerce.com/section4501068327">best practices for customizaing SCA</a> is used by default.

After running `suiteman --init`, you'll have a `.suiteman` file in the root directory of SCA.
Default settings could be changed in this file.

```json
{
    "customFolderName": "extensions",
    "customModuleFolderAfix": {
        "prefix": "",
        "suffix": ".Extension"
    },
    "customFileNameSuffix": ".Ext",
    "customModuleVersion": "1.0.0"
}
```

## Usage

### Customize

To customize file just run `suiteman --customize` in the root folder of SCA application and provide file path starting from the <b>module name</b>
```
suiteman --customize PATH_TO_FILE
or
suiteman -c PATH_TO_FILE 

Example: suiteman -c Account@2.1.0/JavaScript/Account.Login.Model.js

```
### Add dependency to particular application:

```
suiteman -c PATH_TO_FILE -app checkout
or
suiteman -c PATH_TO_FILE -a checkout 

Example: suiteman Account@2.1.0/JavaScript/Account.Login.Model.js -a checkout

```

### Staus
Currently Suiteman supports automated customization for the following file types:
<ul>
<li>JS</li>
<li>Sass(scss)</li>
<li>Templates(tpl)</li>
<li>SuiteScript(ss)</li>
</ul>

Work in progress... :)
