const path = require("path");

module.exports = {
    mode: "development",
    entry: "./src/app.ts",
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist"),
        publicPath: "/dist",
    },
    devServer: {
        onListening: (devServer) => {
            if (!devServer) {
                throw new Error("webpack-dev-server is not defined");
            }
            console.log(`DevServer listening on port: ${devServer.server.address().port}`);
        },
        open: true,
        port: 3000,
        static: {
            directory: path.join(__dirname, "/"),
        },
    },
    devtool: "inline-source-map",
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
};
