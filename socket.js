// Import modules using ESM syntax
import express from 'express';
import { createConnection, createServer } from 'net';
import { statSync, unlinkSync, existsSync } from 'fs';

const app = express();

// Path to the Unix socket file
const unixSocketPath = '/tmp/caendy.sock';

// Check if the Unix socket file already exists
try {
    let stats;
    if (existsSync(unixSocketPath)) {
        stats = statSync(unixSocketPath);
    }
    if (stats && stats.isSocket()) {
        // Socket exists, connect to it and send process.argv
        const client = createConnection({ path: unixSocketPath }, () => {
            // Connection established, send process.argv
            const args = process.argv.slice(2); // Exclude 'node' and script path
            client.write(JSON.stringify(args));
            client.end(); // Close the connection
            process.exit(0); // Exit the app
        });
    } else {
        // Create a Unix domain socket server
const server = createServer((socket) => {
    console.log('Unix socket client connected');

    socket.on('data', (data) => {
        const message = data.toString();
        console.log('Received message:', message);

        // Process the message as needed
        // Example: Respond to the client
        socket.write('Message received');
    });

    socket.on('end', () => {
        console.log('Unix socket client disconnected');
    });

    socket.on('error', (err) => {
        if(err.code != 'ECONNRESET')
        console.error('Socket error:', err);
    });
});
server.on('error', (err) => {
    console.error('Unix socket server error:', err);
    process.exit(1);
});

// Start listening on the Unix socket path
server.listen(unixSocketPath, () => {
    console.log(`Unix socket server is listening on ${unixSocketPath}`);
});

        // Handle process exit to close the server and remove the socket file
        process.on('exit', () => {
            if (existsSync(unixSocketPath)) {
                console.log("unlink");
                unlinkSync(unixSocketPath); // Remove the socket file on app exit
            }
        });
        // Handle process exit to close the server and remove the socket file
        process.on('SIGINT', () => {
            if (existsSync(unixSocketPath)) {
                console.log("unlink");
                unlinkSync(unixSocketPath); // Remove the socket file on app exit
                process.exit(1);
            }
        });

        // Define your Express routes and middleware here
        app.get('/', (req, res) => {
            res.send('Hello World!');
        });
        
        // Start your Express app normally
        const PORT = process.env.PORT || 3000;
            app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
} catch (err) {
    // Error handling for statSync or other file system operations
    console.error('Error checking Unix socket:', err);
    process.exit(1); // Exit the app with an error
}
