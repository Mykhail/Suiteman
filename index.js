#!/usr/bin/env node

"use strict";

const program = require('commander'),
	 suiteHelper = require('./lib/suite-helper').suiteHelper;

program
	.version('2.0.0')
	.option('-i, --init', 'create local configuration file')
	.option('-c, --customize [path]', 'create file customization in accordance with company naming conventions')
	.option('-n, --create [moduleName]')
	.option('-a, --app [applicationName]', 'application to include dependency')
	.parse(process.argv);

let operationType = suiteHelper.getOperationType(program);

switch (operationType)
{
	case 'init':
		init();
		break;
	case 'customize':
		customize(program);
		break;
	case 'create':
		create(program.create);
		break;
	case 'unknowOperation':
		unknowOperation();
		break;
}

function init() {
	suiteHelper.createConfigFile();
}

function customize(options) {
	suiteHelper.loadConfigFile(function(){
		let	filePath = options.customize,
			app = options.app ? options.app.toLowerCase() : 'shopping',
			customizationFilePath = suiteHelper.generateCustomizationFilePath(filePath),
			customizationFileName = suiteHelper.getCustomizationFileName(filePath),
			customizationModuleName = suiteHelper.getCustomizationModuleName(filePath),
			customizationType = suiteHelper.getCustomizationType(filePath);

		//if customization for this file has been created earlier throw an error
		suiteHelper.checkPossibilityToCustomize(filePath, customizationFilePath, customizationFileName);

		//creates customization path and package.json files
		suiteHelper.prepareCustomizationModule(filePath, customizationFilePath, customizationType, () => {
			suiteHelper.createCustomizationFile(filePath, customizationFileName, customizationFilePath);
			suiteHelper.addDependeciesToDistro(filePath, customizationType, customizationFileName, customizationModuleName, app);
		});
	});
}

function create() {
	console.log("Create module functionality is currently unavailable!");
}

function unknowOperation() {
	throw new Error('ERR! UNKNOWN OPERATION!')
}

