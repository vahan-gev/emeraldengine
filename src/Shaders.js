const STANDARD_VERTEX_SHADER = `
  attribute vec4 aVertexPosition;
  attribute vec2 aTextureCoord;
  
  attribute vec4 aInstanceMatrix0;
  attribute vec4 aInstanceMatrix1;
  attribute vec4 aInstanceMatrix2;
  attribute vec4 aInstanceMatrix3;
  
  attribute vec2 aInstanceTexCoord0;
  attribute vec2 aInstanceTexCoord1;
  attribute vec2 aInstanceTexCoord2;
  attribute vec2 aInstanceTexCoord3;

  attribute vec4 aInstanceColor;

  uniform mat4 uModelViewMatrix;
  uniform mat4 uInstancedModelViewMatrix;
  uniform mat4 uProjectionMatrix;
  uniform bool useInstances;

  varying highp vec2 vTexCoord;
  varying vec2 vFragPos;
  varying vec4 vInstanceColor;

  void main() {
    mat4 instanceMatrix = mat4(
      aInstanceMatrix0,
      aInstanceMatrix1,
      aInstanceMatrix2,
      aInstanceMatrix3
    );
    
    if(useInstances) {
        gl_Position = uProjectionMatrix * uInstancedModelViewMatrix * instanceMatrix * aVertexPosition;
        vFragPos = (uInstancedModelViewMatrix * instanceMatrix * aVertexPosition).xy;
        vInstanceColor = aInstanceColor;

        int vertexIndex = int(aVertexPosition.x > 0.0 ? (aVertexPosition.y > 0.0 ? 0 : 2) : (aVertexPosition.y > 0.0 ? 1 : 3));
        
        if(vertexIndex == 0) {
            vTexCoord = aInstanceTexCoord0;
        } else if(vertexIndex == 1) {
            vTexCoord = aInstanceTexCoord1;
        } else if(vertexIndex == 2) {
            vTexCoord = aInstanceTexCoord2;
        } else {
            vTexCoord = aInstanceTexCoord3;
        }
    } else {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vFragPos = (uModelViewMatrix * aVertexPosition).xy;
        vTexCoord = aTextureCoord;
        vInstanceColor = vec4(1.0);
    }
  }
`;

const STANDARD_FRAGMENT_SHADER = `
    #ifdef GL_ES
    precision highp float;
    #endif
    uniform bool useTexture;
    uniform vec4 uColor;
    uniform sampler2D uSampler;
    uniform float uOpacity;

    uniform vec2 uLightPosition[4];
    uniform vec3 uLightColor[4];
    uniform float uLightIntensity[4];
    uniform float uLightRadius[4];
    uniform int uActiveLights;
    
    uniform vec2 uDirLightPosition[4];
    uniform vec2 uDirLightDirection[4];
    uniform vec3 uDirLightColor[4];
    uniform float uDirLightIntensity[4];
    uniform float uDirLightWidth[4];
    uniform int uActiveDirLights;
    
    uniform vec3 uAmbientLightValues;
    uniform bool uUseLighting;

    varying vec2 vTexCoord;
    varying vec2 vFragPos;
    varying vec4 vInstanceColor;

    void main() {
        vec4 ambientLight = vec4(uAmbientLightValues.xyz, 1.0);

        vec4 texColor;
        if (useTexture) {
            texColor = texture2D(uSampler, vTexCoord);
            if (texColor.a < 0.01) discard;
            texColor *= uColor;
        } else {
            texColor = uColor;
        }

        texColor *= vInstanceColor;
        
        vec3 lighting = ambientLight.rgb;
        
        for(int i = 0; i < 4; i++) {
            if(i >= uActiveLights) break;
            
            float distance = length(uLightPosition[i] - vFragPos);
            
            if(distance < uLightRadius[i]) {
                float attenuation = 1.0 - distance / uLightRadius[i];
                
                lighting += uLightColor[i] * attenuation * uLightIntensity[i];
            }
        }
        
        for(int i = 0; i < 4; i++) {
            if(i >= uActiveDirLights) break;
            
            vec2 lightPos = uDirLightPosition[i];
            vec2 lightDir = normalize(uDirLightDirection[i]);
            vec2 toFrag = vFragPos - lightPos;
            
            float projection = dot(toFrag, lightDir);
            if(projection < 0.0) continue;
            
            float perpDistance = abs(dot(toFrag, vec2(-lightDir.y, lightDir.x)));
            
            if(perpDistance > uDirLightWidth[i] * 0.5) continue;
            
            float widthFactor = 1.0 - (perpDistance / (uDirLightWidth[i] * 0.5));
            
            float distance = length(toFrag);
            float maxDistance = 1000.0;
            float distanceFactor = max(0.0, 1.0 - (distance / maxDistance));
            
            lighting += uDirLightColor[i] * uDirLightIntensity[i] * widthFactor * distanceFactor;
        }
        
        vec4 outColor;
        if (uUseLighting) {
            outColor = vec4(texColor.rgb * lighting, texColor.a);
        } else {
            outColor = texColor;
        }
        outColor.a *= clamp(uOpacity, 0.0, 1.0);
        gl_FragColor = outColor;
    }
`;

export { STANDARD_VERTEX_SHADER, STANDARD_FRAGMENT_SHADER };
