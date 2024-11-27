const { execSync } = require('child_process');

try {
    // Retrieve the GitHub token from 1Password
    const token = execSync('op item get "pB" --field GH_TOKEN --reveal', { encoding: 'utf-8' }).trim();

    if (!token) {
        throw new Error('Failed to retrieve GH_TOKEN from 1Password.');
    }

    console.log('Deploying ...');

    // Run the deployment command
    execSync(`set GH_TOKEN=${token} && electron-builder build --win --publish always`, {
        stdio: 'inherit',
        shell: true,
    });
} catch (error) {
    console.error('Deployment failed:', error.message);
    process.exit(1);
}
