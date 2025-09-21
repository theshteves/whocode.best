//import init, { processLoomCode } from './wasm.js';
//
//// Initialize CodeMirror
//const editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
//    lineNumbers: true,
//    mode: 'text/x-c++src',
//    indentUnit: 4
//});
//
//// Initialize WebAssembly
//async function initialize() {
//    try {
//        await init();
//        document.getElementById('status').textContent = 'Ready';
//        document.getElementById('run-btn').disabled = false;
//    } catch (e) {
//        document.getElementById('status').textContent = `Error: ${e}`;
//        console.error('WASM initialization failed:', e);
//    }
//}
//
//// Run button handler
//document.getElementById('run-btn').addEventListener('click', () => {
//    const status = document.getElementById('status');
//    const output = document.getElementById('output');
//    
//    status.textContent = 'Running...';
//    output.textContent = '';
//    
//    try {
//        const result = processLoomCode(editor.getValue());
//        output.textContent = result;
//        status.textContent = 'Done';
//    } catch (e) {
//        status.textContent = `Error: ${e}`;
//        console.error('Execution failed:', e);
//    }
//});
//
//// Start the application
//initialize();



//// bin/web/public/app.js
//// First, verify the module is being loaded
//console.log("app.js loaded");
//
//// Debug function to test the module
//async function testModule() {
//    try {
//        console.log("Testing module...");
//        const Module = await createLoomModule();
//        console.log("Module loaded:", Module);
//        
//        // Test the direct function call
//        console.log("Testing testFunction...");
//        const result = Module.testFunction ? 
//            Module.testFunction() : 
//            "testFunction not found in module";
//        console.log("testFunction result:", result);
//        
//        // Test the wrapped function
//        console.log("Testing processLoomCode...");
//        const processFunc = Module.processLoomCode || 
//                          (Module.cwrap && Module.cwrap('processLoomCode', 'string', ['string']));
//        
//        if (processFunc) {
//            const output = typeof processFunc === 'function' ? 
//                processFunc("test input") : 
//                "Could not call processLoomCode";
//            console.log("processLoomCode result:", output);
//        } else {
//            console.error("processLoomCode not found in module");
//            console.log("Available module properties:", Object.keys(Module).join(", "));
//        }
//        
//        return Module;
//    } catch (e) {
//        console.error("Error in testModule:", e);
//        throw e;
//    }
//}
//
//// Initialize the application
//async function initialize() {
//    const status = document.getElementById('status');
//    const output = document.getElementById('output');
//    
//    try {
//        console.log("Initializing WebAssembly...");
//        status.textContent = 'Loading WebAssembly...';
//        
//        // Test the module
//        const Module = await testModule();
//        
//        // Store the module for later use
//        window.loomModule = Module;
//        status.textContent = 'Ready';
//        document.getElementById('run-btn').disabled = false;
//        console.log("Initialization complete");
//    } catch (e) {
//        const errorMsg = `Initialization failed: ${e}`;
//        console.error(errorMsg, e);
//        status.textContent = errorMsg;
//    }
//}
//
//// Run button handler
//document.getElementById('run-btn').addEventListener('click', () => {
//    const status = document.getElementById('status');
//    const output = document.getElementById('output');
//    
//    status.textContent = 'Running...';
//    output.textContent = '';
//    
//    try {
//        if (!window.loomModule) {
//            throw new Error("WebAssembly module not loaded");
//        }
//        
//        const code = editor.getValue();
//        console.log("Running with code:", code);
//        
//        // Try both direct and wrapped calls
//        const result = window.loomModule.processLoomCode ? 
//            window.loomModule.processLoomCode(code) :
//            "Function not available";
//            
//        output.textContent = result;
//        status.textContent = 'Done';
//    } catch (e) {
//        const errorMsg = `Error: ${e}`;
//        console.error(errorMsg, e);
//        status.textContent = errorMsg;
//        output.textContent = `Error details: ${e.stack || e}`;
//    }
//});
//
//// Start the application
//initialize();



// bin/web/public/app.js
// Wait for the module to be ready
const status = document.getElementById('status');
const output = document.getElementById('output');

// Initialize CodeMirror
const editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
    lineNumbers: true,
    mode: 'text/x-c++src',
    indentUnit: 4
});

// Initialize the application
async function initialize() {
    try {
        status.textContent = 'Loading WebAssembly...';
        console.log("Loading WebAssembly module...");
        
        // Wait for the module to be ready
        const Module = await window.loomModulePromise;
        console.log("WebAssembly module loaded:", Module);
        
        // Test the module
        try {
            console.log("Testing module functions...");
            
            // Get the function pointer
            const testResult = Module.ccall(
                'testFunction',  // function name
                'string',        // return type
                [],              // argument types
                []               // arguments
            );
            
            console.log("testFunction result:", testResult);
            output.textContent = `Test successful! ${testResult}\n\n`;
            
            // Store the module for later use
            window.loomModule = Module;
            status.textContent = 'Ready';
            document.getElementById('run-btn').disabled = false;
            console.log("Initialization complete");
        } catch (e) {
            console.error("Error testing module:", e);
            throw new Error(`Module test failed: ${e}`);
        }
    } catch (e) {
        const errorMsg = `Initialization failed: ${e}`;
        console.error(errorMsg, e);
        status.textContent = errorMsg;
        output.textContent = `Error details: ${e.stack || e}`;
    }
}

// Run button handler
document.getElementById('run-btn').addEventListener('click', async () => {
    const status = document.getElementById('status');
    const output = document.getElementById('output');
    
    status.textContent = 'Running...';
    
    try {
        if (!window.loomModule) {
            throw new Error("WebAssembly module not loaded");
        }
        
        const code = editor.getValue();
        console.log("Running with code:", code);
        
        // Call the C++ function using ccall
        const result = window.loomModule.ccall(
            'processLoomCode',  // function name
            'string',           // return type
            ['string'],         // argument types
            [code]              // arguments
        );
        
        output.textContent += `> ${code}\n${result}\n\n`;
        status.textContent = 'Done';
    } catch (e) {
        const errorMsg = `Error: ${e}`;
        console.error(errorMsg, e);
        status.textContent = errorMsg;
        output.textContent += `Error: ${e.message || e}\n\n`;
    }
});

// Start the application
initialize();
