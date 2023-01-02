const fs = require('fs');
const licenseFilePath = './licenses.json';
const licensesRefPath = './licensesRef.json';
const versionSeparator = '@';

function checkLicenses() {
    let optionsReadFile = {encoding: 'utf8'};
    let licenses = JSON.parse((fs.readFileSync(licenseFilePath, optionsReadFile)));
    let licenseRef = JSON.parse((fs.readFileSync(licensesRefPath, optionsReadFile)));

    for (let license in licenses) {
        if (!licenses.hasOwnProperty(license)) {
            continue;
        }

        let moduleName = license.substr(0, license.indexOf(versionSeparator)); // removes version number

        // unknown license, but plugin is valid
        if (licenseRef.validModules.indexOf(moduleName) > -1) {
            continue;
        }

        if (licenseRef.validLicenses.indexOf(licenses[license].licenses.toString()) === -1) {
            console.log(('Plugin license not valid: ') + license + ' - ' + licenses[license].licenses);
            throw new Error('License check failed - check license file!');
        }
    }
}

checkLicenses();