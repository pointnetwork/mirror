const axios = require('axios');
const fs = require('fs');
const mkdirp = require('mkdirp');

const mirrors = require('./mirror.point/public/mirrors.json');

// todo: catch error and continue, don't fail. look at all errors or better yet do try-catch (if axios.get fails for example)

(async() => {
    for(let mirror of mirrors) {
        console.log(`Processing ${mirror.id}...`);
        const source_url = mirror.src;

        // Download
        const res = await axios.get(mirror.src, {
            transformResponse: res => res,
            responseType: 'text'
        });
        const data = res.data;

        // Validation
        for(let validation of mirror.validation) {
            if (validation === 'json') {
                // try to dejson
                try {
                    const decoded = JSON.parse(data);
                } catch(e) {
                    throw new Error('json validation failed');
                }
            } else {
                throw new Error('unknown validation method'); // todo:
            }
        }

        // Save
        const rootFolder = 'mirror.point/public/data/';
        if (mirror.id.includes('/')) {
            const parts = mirror.id.split('/');
            parts.pop();
            const dir = parts.join('/');
            const fullDir = rootFolder + dir;
            console.log(fullDir);
            await mkdirp(fullDir);
        }
        const fileName = rootFolder + mirror.id;
        fs.writeFileSync(fileName, data);

        // Compare with latest version

        // Upload
        const cmd = "$HOME/.point/bin/macos/point deploy ./mirror.point";
    }
})();