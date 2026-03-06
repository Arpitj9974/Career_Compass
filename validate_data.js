const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'server/data/after_10th');
const LOG_FILE = path.join(__dirname, 'validation_log.txt');

function log(msg) {
    console.log(msg);
    fs.appendFileSync(LOG_FILE, msg + '\n');
}

function validateNode(node, parentFile) {
    if (node.lazy) {
        const expectedFile = path.join(DATA_DIR, `${node.id}.json`);
        if (!fs.existsSync(expectedFile)) {
            log(`[ERROR] Missing file for lazy node: ${node.id} (referenced in ${parentFile})`);
            return;
        }

        try {
            const content = fs.readFileSync(expectedFile, 'utf-8');
            const data = JSON.parse(content);
            log(`[OK] Loaded ${node.id}.json (${data.children.length} children)`);

            if (data.children.length === 0) {
                log(`[WARNING] Node ${node.id} has 0 children!`);
            }

            data.children.forEach(child => validateNode(child, `${node.id}.json`));
        } catch (err) {
            log(`[ERROR] Invalid JSON in ${node.id}.json: ${err.message}`);
        }
    }
}

// Start with 100.json
log('Starting Validation...');
const rootFile = path.join(DATA_DIR, '100.json');

if (fs.existsSync(rootFile)) {
    try {
        const root = JSON.parse(fs.readFileSync(rootFile, 'utf-8'));
        log(`[OK] Loaded 100.json (Root)`);
        root.children.forEach(child => validateNode(child, '100.json'));
    } catch (err) {
        log(`[ERROR] Invalid 100.json: ${err.message}`);
    }
} else {
    log('[ERROR] 100.json not found!');
}
