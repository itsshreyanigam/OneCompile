const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const compiler = require('./node_modules/compilex'); // Ensure this path is correct
const options = { stats: true };
compiler.init(options);

app.use(bodyParser.json());
app.use(express.static(__dirname));  // To serve static files like index.html and codemirror

app.get('/', (req, res) => {
    compiler.flush(() => {
        console.log("Deleted temporary files.");
    });
    res.sendFile(__dirname + "/index.html");
});

app.post('/compile', (req, res) => {
    const { code, input, lang } = req.body;

    const compileCallback = (data) => {
        if (data.error) {
            console.error(`Compilation error for ${lang}: ${data.error}`);
            res.send({ output: data.error });
        } else {
            res.send({ output: data.output });
        }
    };

    const envData = { OS: "windows" }; // Adjust based on your environment
    switch (lang) {
        case "C":
            envData.cmd = "gcc";
            if (input) {
                compiler.compileCPPWithInput(envData, code, input, compileCallback);
            } else {
                compiler.compileCPP(envData, code, compileCallback);
            }
            break;
        case "C++":
            envData.cmd = "g++";
            if (input) {
                compiler.compileCPPWithInput(envData, code, input, compileCallback);
            } else {
                compiler.compileCPP(envData, code, compileCallback);
            }
            break;
        case "Java":
            if (input) {
                compiler.compileJavaWithInput(envData, code, input, compileCallback);
            } else {
                compiler.compileJava(envData, code, compileCallback);
            }
            break;
        case "Python":
            if (input) {
                compiler.compilePythonWithInput(envData, code, input, compileCallback);
            } else {
                compiler.compilePython(envData, code, compileCallback);
            }
            break;
        default:
            res.send({ output: "Unsupported language" });
    }
});

app.listen(8000, () => {
    console.log('Server is running on port 8000');
});
