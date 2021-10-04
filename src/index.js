const fs = require('fs');
const args = require('args');
const chalk = require('chalk');
const constants = {
    DEFAULT_NAME: 'Plantilla App',
    DEFAULT_PACKAGE: 'com.rcp.plantillaapp',
    DEFAULT_PACKAGE_ID: 'plantillaapp',
};

const findFolder = () => {
    if (fs.existsSync('android/app/src/main/java/com')) {
        let folders = fs.readdirSync('android/app/src/main/java/com');
        if (folders.length) {
            return folders[0];
        }
    }
    return null;
};

const getPackageId = ( package ) => {
    let parts = package.split('.');
    return parts[parts.length - 1];
};

const replacetext = (someFile, prev_text, new_text) => {
    try {
        if (fs.existsSync(someFile)) {
            let content = fs.readFileSync(someFile, 'utf-8');
            let new_content = content.replace(new RegExp(prev_text, 'g'), new_text);

            if( content !== new_content ){
                fs.writeFileSync(someFile, new_content, 'utf-8');
                return chalk.green(`Actualizado`);
            }else{
                return chalk.yellow(`No modificado`);
            }
        } else {
            return chalk.red(`No encontrado`);
        }
    } catch (err) {
        return chalk.red(`Error al actualizar`);
    }

};

module.exports = async () => {
    try {

        args
            .option('package', 'New Package')
            .option('name', 'New App Name');

        const flags = args.parse(process.argv);

        if (!flags.package) {
            console.log('Missing new package, use the flag -p com.new.package');
            return;
        }

        if (!flags.name) {
            console.log('Missing App name, use the flag -n "New Name');
            return;
        }

        flags.package_id = getPackageId(flags.package);

        let folder = findFolder('android/app/src/main/java/com');
        if (folder) {

            let files = [
                {
                    path: `app.json`,
                    search: constants.DEFAULT_PACKAGE_ID,
                    replace: getPackageId(flags.package),
                },
                {
                    path: `package.json`,
                    search: constants.DEFAULT_PACKAGE_ID,
                    replace: flags.package_id,
                },
                {
                    path: `android/settings.gradle`,
                    search: constants.DEFAULT_PACKAGE_ID,
                    replace: flags.package_id,
                },
                {
                    path: 'android/app/BUCK',
                    search: constants.DEFAULT_PACKAGE,
                    replace: flags.package,
                },
                {
                    path: 'android/app/build.gradle',
                    search: constants.DEFAULT_PACKAGE,
                    replace: flags.package,
                },
                {
                    path: 'android/app/src/main/AndroidManifest.xml',
                    search: constants.DEFAULT_PACKAGE,
                    replace: flags.package,
                },
                {
                    path: `android/app/src/main/java/com/${folder}/MainActivity.java`,
                    search: constants.DEFAULT_PACKAGE,
                    replace: flags.package,
                },
                {
                    path: `android/app/src/main/java/com/${folder}/MainActivity.java`,
                    search: constants.DEFAULT_PACKAGE_ID,
                    replace: flags.package_id,
                },
                {
                    path: `android/app/src/main/java/com/${folder}/MainApplication.java`,
                    search: constants.DEFAULT_PACKAGE,
                    replace: flags.package,
                },
                {
                    path: `android/app/src/main/java/com/${folder}/MainApplication.java`,
                    search: constants.DEFAULT_PACKAGE_ID,
                    replace: flags.package_id,
                },
                {
                    path: `android/app/src/main/res/values/strings.xml`,
                    search: constants.DEFAULT_NAME,
                    replace: flags.name
                }
            ];

            files.forEach(someFile => {
                console.log(chalk.blue(someFile.path) + ' -> ' + replacetext(someFile.path, someFile.search, someFile.replace));
            });
        } else {
            console.log(chalk.yellow('Package folder not found...'));
        }
    } catch (err) {
        console.log(chalk.red(`Error on update files: ${err.message}`));
    }
}