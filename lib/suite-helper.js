"use strict";

const fs = require('fs'),
	path = require('path'),
	mkdirp = require('mkdirp'),
	jsonfile = require('jsonfile'),
	_ = require('underscore'),
	config = require('./../config'),

	CONFIG_FILE_NAME = '.suiteman',
	DISTRO_JSON_PATH = path.normalize('./distro.json'),
	ROOT_MODULES_FOLDER = path.normalize('./Modules/'),
	NATIVE_MODULES_FOLDER = path.normalize('./Modules/suitecommerce/'),
	NS_PACKAGE_JSON = 'ns.package.json';

let suiteHelper = {
	//@method getFileName Parse path and returns file name
	//@return {String}
	getFileName: function(fullPath) {
		return path.basename(fullPath);
	},

	//@method getModuleName Parse path and returns module name
	//@return {String}
	getModuleName: function(fullPath) {
		return fullPath.split(path.sep)[0];
	},

	//@method strSplice helper to splice a string
	//@return {String}
	strSplice: function(str, index, count, add) {
		let ar = str.split('');
		ar.splice(index, count, add);
		return ar.join('');
	},

	//@method checkPossibilityToCustomize checks customizations path and throw an error if customization for this file already exists
	//@return {Void}
	checkPossibilityToCustomize: function(filePath, customizationFilePath, customizationFileName) {
		if (!fs.existsSync(NATIVE_MODULES_FOLDER + filePath)) {
			throw new Error('ERR! FILE DOES NOT EXIST')
		}

		if (fs.existsSync(customizationFilePath + customizationFileName)) {
			throw new Error('ERR! CUSTOMIZATION FILE ALREADY EXISTS')
		}
	},

	//@method getCustomizationFileName generates customization file name in accordance with NS best practices
	//@return {String}
	getCustomizationFileName: function(fullPath) {
		let originalFileName = this.getFileName(fullPath),
			ext = path.extname(fullPath),
			customFileNameSuffix = config.customFileNameSuffix;

		switch (ext.replace('.','')) {
			case 'js':
				//Check is it a backend model customization
				if(this.isSuiteScriptCustomization(fullPath)) {
					return this.isBackendConfiguration(fullPath) ? this.strSplice(originalFileName, originalFileName.indexOf(ext), 0, customFileNameSuffix) : originalFileName;
				} else {
					return this.strSplice(originalFileName, originalFileName.indexOf(ext), 0, customFileNameSuffix);
				}
			case 'scss':
				return this.strSplice(originalFileName, originalFileName.indexOf(ext), 0, customFileNameSuffix);
			case 'tpl':
				return originalFileName;
			case 'ssp':
				return originalFileName;
			case 'ss':
				return originalFileName;
			default:
				throw "Suiteman can't provide automate customization for this file's extension";
		}

	},
	//@method getCustomizationModuleName generates customization module name in accordance with NS best practices
	//@return {String}
	getCustomizationModuleName: function(fullPath, withoutVersion) {

		if (!config.customModuleFolderAfix || config.customModuleFolderAfix && !config.customModuleFolderAfix.prefix && !config.customModuleFolderAfix.suffix) {
			throw new Error('ERR! You have to define at least one affix in your configuration file!');
		} else {
			config.customModuleFolderAfix.prefix = config.customModuleFolderAfix.prefix || '';
			config.customModuleFolderAfix.suffix = config.customModuleFolderAfix.suffix || '';
		}

		if (withoutVersion) {
			return config.customModuleFolderAfix.prefix + fullPath.split(path.sep)[0].replace(/[@]\d\.\d\.\d/, '') + config.customModuleFolderAfix.suffix;

		} else {
			let customModuleName = fullPath.split(path.sep)[0].split('@');
			customModuleName = config.customModuleFolderAfix.prefix + customModuleName[0] + config.customModuleFolderAfix.suffix + '@' + config.customModuleVersion;

			return customModuleName;
		}
	},

	//@method prepareCustomizationModule creates customizations folder and package.json file
	//@return {Void}
	prepareCustomizationModule: function(filePath, customizationFilePath, customizationType, callback) {
		let customizationModuleName = this.getCustomizationModuleName(filePath),
			self = this;

		if (!fs.existsSync(customizationFilePath)) {
			mkdirp(customizationFilePath, (err) => {
				if(err) {
					console.error(err)
				} else {
					let customizationNsPackagePath = ROOT_MODULES_FOLDER + config.customFolderName + path.sep + customizationModuleName + path.sep + NS_PACKAGE_JSON;
					if (!fs.existsSync(customizationNsPackagePath)) {
						let stream = fs.createReadStream(NATIVE_MODULES_FOLDER + self.getModuleName(filePath) + path.sep + NS_PACKAGE_JSON).pipe(fs.createWriteStream(customizationNsPackagePath));

						let had_error = false;
						stream.on('error', (err) => {
							had_error = true;
						});
						stream.on('close', () => {
							if (!had_error) {
								callback()
							} else {
								throw new Error('Err! ns.package.json was not created due errors!')
							}
						});
					} else {
						callback();
					}
				}
			});
		} else {
			callback();
		}
	},

	//@method generateCustomizationFilePath Generate customization file path to file
	//@return {String}
	generateCustomizationFilePath: function(filePath) {
		let fileType = this.getCustomizationType(filePath),
			customizationModuleName = this.getCustomizationModuleName(filePath);

		return ROOT_MODULES_FOLDER + config.customFolderName + path.sep + customizationModuleName + path.sep + fileType + path.sep;
	},

	createCustomizationFile: function(filePath, customizationFileName, customizationFilePath) {
		customizationFilePath = customizationFilePath + customizationFileName;
		if (!fs.existsSync(customizationFilePath)) {
			let stream = fs.createReadStream(NATIVE_MODULES_FOLDER + filePath).pipe(fs.createWriteStream(customizationFilePath));

			stream.on('error', (err) => {
				throw new Error(err);
			});
		}
	},

	//@method getCustomizationType Analyse file's extension and return type of customization requested by user
	//@return {Void}
	getCustomizationType: function(filePath) {
		let ext = path.extname(filePath).replace('.', '');
		switch (ext) {
			case 'js':
				if(this.isSuiteScriptCustomization(filePath)) {
					return 'SuiteScript';
				} else {
					return 'JavaScript';
				}
			case 'scss':
				return 'Sass';
			case 'tpl':
				return 'Templates';
			case 'ssp':
				return 'SuiteScript';
			case 'ss':
				return 'SuiteScript';
			default:
				throw "Suiteman can't provide automate customization for this file's extension";
		}
	},
	//@method addCustModuleToDistro Provides refernce to customization module to distro.json file
	//@return {Void}
	addCustModuleToDistro: function(distroJson, customizationModuleName) {
		distroJson.modules[config.customFolderName + path.sep + customizationModuleName.replace('@' + config.customModuleVersion, '')] = config.customModuleVersion
	},

	//@method getOperationType Parse options and return type of operation requested by user
	//@return {String}
	getOperationType: function(options) {
		if (options.init) {
			return 'init';
		}
		else if (options.customize) {
			return 'customize';
		} else if (options.create) {
			return 'create';
		} else {
			return 'unknowOperation';
		}
	},

	//@method getOperationType Return app entry point
	//@return {String}
	getAppEntryPoint: function(app) {
		switch (app) {
			case 'shopping':
				return 'SC.Shopping.Starter';
			case 'checkout':
				return 'SC.Checkout.Starter';
			case 'myaccount':
				return 'SC.MyAccount.Starter';
			default:
				return 'SC.Shopping.Starter';
		}
	},

	//@method isSuiteScriptCustomization Analyses path ant return true if user requested customization of suitescript related file
	//@return {Boolean}
	isSuiteScriptCustomization: function(filePath) {
		return filePath.toLowerCase().indexOf(path.normalize('/suitescript/')) > -1;
	},

	//@method isBackendConfiguration Analyses path ant return true if user requested customization of on of backend configuration files
	//@return {Boolean}
	isBackendConfiguration: function(filePath) {
		return filePath.toLowerCase().indexOf('configuration') !== -1
	},

	//@method jsCustomizationHandler Handles js customizations
	//@return {Void}
	jsCustomizationHandler: function(distroJson, addDependecyToApp, customizationFileName) {
		_.each(distroJson.tasksConfig.javascript, function(app) {
			if (app.entryPoint === this.getAppEntryPoint(addDependecyToApp)) {
				let isModuleIncluded = !!~app.dependencies.indexOf(customizationFileName);
				if(!isModuleIncluded) {
					!app.dependencies[customizationFileName.replace('.js', '')] && app.dependencies.unshift(customizationFileName.replace('.js', ''));
				}
			}
		}, this);
	},

	//@method sassCustomizationHandler Handles sass customizations
	//@return {Void}
	sassCustomizationHandler: function(distroJson, addDependecyToApp, filePath) {
		let moduleNameWithoutVersion = this.getCustomizationModuleName(filePath, true);

		_.each(distroJson.tasksConfig.sass.applications, (app) => {
			if (app.name.toLowerCase() === addDependecyToApp) {
				let isModuleIncluded = false;
				_.each(app.dependencies, (dep) => {
					if (dep === moduleNameWithoutVersion || dep.module === moduleNameWithoutVersion)
						isModuleIncluded = true;
				});

				if(!isModuleIncluded) {
					app.dependencies.push(moduleNameWithoutVersion);
				}
			}
		});
	},

	//@method tplCustomizationHandler Handles tpl customizations
	//@return {Void}
	tplCustomizationHandler: function(filePath) {
		let packageJsonPath = ROOT_MODULES_FOLDER + config.customFolderName + path.sep + this.getCustomizationModuleName(filePath) + path.sep + NS_PACKAGE_JSON;
		jsonfile.readFile(packageJsonPath, (err, nsPackageJson) => {

			if(!nsPackageJson.overrides){ nsPackageJson.overrides = {}}
			nsPackageJson.overrides['suitecommerce' + path.sep + filePath] = "Templates" + path.sep + this.getFileName(filePath);

			jsonfile.writeFile(packageJsonPath, nsPackageJson, {spaces: 4}, function(err) {
				err && console.error(err)
			})
		});
	},

	//@method suiteScriptCustomizationHandler Handles SuiteScript customizations
	//@return {Void}
	suiteScriptCustomizationHandler: function(distroJson, filePath, customizationFileName) {
		let packageJsonPath = ROOT_MODULES_FOLDER + config.customFolderName + path.sep + this.getCustomizationModuleName(filePath) + path.sep + NS_PACKAGE_JSON;

		if (this.isBackendConfiguration(filePath)) {

			!distroJson.tasksConfig['ssp-libraries']['dependencies'][customizationFileName.replace('.js', '')] &&
			distroJson.tasksConfig['ssp-libraries']['dependencies'].unshift(customizationFileName.replace('.js', ''));
		} else {
			jsonfile.readFile(packageJsonPath, (err, nsPackageJson) => {

				if(!nsPackageJson.overrides){ nsPackageJson.overrides = {}}
				nsPackageJson.overrides['suitecommerce' + path.sep + filePath] = "SuiteScript" + path.sep + this.getFileName(filePath);

				jsonfile.writeFile(packageJsonPath, nsPackageJson, {spaces: 4}, (err) => {
					err && console.error(err)
				});
			});
		}
	},

	addDependeciesToDistro: function(filePath, customizationType, customizationFileName, customizationModuleName, app) {
		jsonfile.readFile(DISTRO_JSON_PATH, (err, distroJson) => {

			this.addCustModuleToDistro(distroJson, customizationModuleName);
			switch (customizationType) {
				case 'JavaScript':
					this.jsCustomizationHandler(distroJson, app, customizationFileName);
					break;
				case 'Sass':
					this.sassCustomizationHandler(distroJson, app, filePath);
					break;
				case 'Templates':
					this.tplCustomizationHandler(filePath);
					break;
				case 'SuiteScript':
					this.suiteScriptCustomizationHandler(distroJson, filePath, customizationFileName);
					break;
				default:
					throw "Unknow customization type";
			}

			jsonfile.writeFile(DISTRO_JSON_PATH, distroJson, {spaces: 4}, (err) => {
				err && console.error(err)
			})
		});
	},

	isFile: function(path){
		try {
			return fs.lstatSync(path).isFile();
		} catch(e) {
			return false;
		}
	},

	createConfigFile: function() {
		jsonfile.writeFile(CONFIG_FILE_NAME, config, {spaces: 2}, function (err) {
			err && console.error(err)
		})
	},

	loadConfigFile: function(callback) {

		let configFilePath = process.cwd();
		configFilePath = configFilePath + path.sep + CONFIG_FILE_NAME;

		if (this.isFile(configFilePath)) {
			jsonfile.readFile(configFilePath, (err, userConfig) => {
				_.extend(config, userConfig);
				callback();
			});
		} else {
			callback();
		}
	}
};

module.exports.suiteHelper = suiteHelper;