const path = require('path');

module.exports = {
    mode: 'development',
    devtool: 'source-map',

    context: path.resolve(process.cwd(), 'src'),

    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        modules: ['src', 'node_modules'],
    },

    entry: {
        main: 'main',
    },

    output: {
        path: path.resolve(process.cwd(), 'dest'),
        publicPath: '/',
        filename: '[name].js',
        chunkFilename: '[name].js',
    },

    module: {
        rules: [
            {
                test: /(\.tsx?)$/,
                use: [
                    {
                        loader: 'awesome-typescript-loader',
                        options: { silent: true },
                    },
                ],
            },
        ],
    },

    performance: {
        hints: false,
    },

    optimization: {
        minimize: false,
    },

    stats: {
        children: false,
        chunks: false,
    },

    devServer: {
        contentBase: path.join(__dirname, 'dest'),
        compress: true,
        port: 9000,
    },
};