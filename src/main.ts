import './style.css'
import fragmentShaderString from "./shaders/fragmentShader.frag";
import vertexShaderString from "./shaders/vertexShader.vert";

const createBaseShader = (gl: WebGLRenderingContext, shaderType: GLenum, shaderText: string) => {
    const shader = gl.createShader(shaderType);
    if (shader) {
        gl.shaderSource(shader, shaderText);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const status = gl.getShaderInfoLog(shader);
            alert(status);
            return undefined;
        }
        return shader;
    }

}
const createProgram = (gl: WebGLRenderingContext, vertShader: WebGLShader, fragShader: WebGLShader) => {
    const program = gl.createProgram();
    if (program) {
        gl.attachShader(program, vertShader);
        gl.attachShader(program, fragShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            alert(gl.getProgramInfoLog(program));
            return undefined;
        }

        return program;
    }

}

const initBuffer = (gl: WebGLRenderingContext) => {
    return {
        position: initPositionBuffer(gl),
    }
}
const initPositionBuffer = (gl: WebGLRenderingContext) => {

    const positionBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);


    const positions = [
        1.0, 1.0,
        -1.0, 1.0,
        1.0, -1.0,
        -1.0, -1.0,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    return positionBuffer;
}

function drawScene(gl: WebGLRenderingContext, programInfo, buffers) {
    gl.clearColor(0, 0, 0, 1);
    gl.clearDepth(1);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    setPositionAttribute(gl, buffers, programInfo);


    gl.useProgram(programInfo.program);

}

function setPositionAttribute(gl: WebGLRenderingContext, buffers, programInfo) {
    const numComponents = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset,
    )
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
}

const setup = () => {
    const canvas = document.createElement("canvas");
    canvas.width = innerWidth;
    canvas.height = innerHeight;

    document.body.appendChild(canvas);

    const gl = canvas.getContext("webgl");

    const frag = createBaseShader(gl, gl.FRAGMENT_SHADER, fragmentShaderString);
    const vert = createBaseShader(gl, gl.VERTEX_SHADER, vertexShaderString);

    if (frag && vert) {
        const program = createProgram(gl, vert, frag);
        const programInfo = {
            program: program,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(program, "aVertexPosition"),
            },
            uniformLocations: {
                uPosition: gl.getUniformLocation(program, "uMPos"),
                uSize: gl.getUniformLocation(program, "uSize"),
                uTime: gl.getUniformLocation(program, "uTime"),
            },
        };
        const buffers = initBuffer(gl);

        return {
            gl,
            program,
            programInfo,
            buffers
        }
    }

}
const onLoad = () => {
    const position = [
        innerWidth / 2.,
        innerHeight / 2.,
    ];

    window.addEventListener("mousemove", (x: MouseEvent) => {
        position[0] = x.x;
        position[1] = innerHeight - x.y;
    });

    const info = setup();
    if (info) {
        let lastTime = 0;
        const animate = (time) => {
            const deltaTime = time - lastTime;
            lastTime = time;
            drawScene(info.gl, info.programInfo, info.buffers);

            info.gl.uniform2fv(
                info.programInfo.uniformLocations.uPosition,
                new Float32Array(position),
            )
            info.gl.uniform2fv(
                info.programInfo.uniformLocations.uSize,
                new Float32Array([innerWidth, innerHeight]),
            )
            info.gl.uniform1f(
                info.programInfo.uniformLocations.uTime,
                time,
            )

            info.gl.drawArrays(info.gl.TRIANGLE_STRIP, 0, 4);
            requestAnimationFrame(animate);
        }

        animate();
    }

}


window.addEventListener("load", onLoad);