# Suiteman

Suiteman is a simple tool created to automate customization process of Suite Commerce Advanced applications.

Different types of files and resources in SuiteCommerce have different recommended best practices.
Newcomers are always confused how to choose the right one.
Moreover, even seasoned SCA veterans sometimes forget about company naming conventions and get annoyed when they need to do all copy/paste file manipulations.

Suiteman analyzes file path and creates all customization files in accordance with your company naming conventions.
Moreover, it automatically adds all required dependencies to appropriate place in distro.json file.

Demo:

[[https://github.com/Mykhail/Suiteman/blob/master/img/demo.gif|alt=demo]]

## Installation

To make Suiteman available to run across all of your SCA projects, we recommend installing it globally. You can do so using npm:

```
$ npm install suiteman -g
```


After that, you can run Suiteman on any SCA applications. Just run it in the root of Suite Commerce Advanced application :

```
$ suiteman PATH_TO_FILE

Example: suiteman Account@2.1.0/JavaScript/Account.Login.Model.js

```

## Configuration

By default Suiteman uses naming convention recommended on https://developers.suitecommerce.com/section4501068327

But, if you want to use your own you can always redefine it in a configuration file.

After running `suiteman --init`, you'll have a `.suiteman` file in root directory of SCA.

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

