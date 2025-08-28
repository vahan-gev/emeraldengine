const STANDARD_VERTEX_SHADER = `
  attribute vec4 aVertexPosition;
  attribute vec2 aTextureCoord;
  
  // Instance matrix (each row as a separate attribute)
  attribute vec4 aInstanceMatrix0;
  attribute vec4 aInstanceMatrix1;
  attribute vec4 aInstanceMatrix2;
  attribute vec4 aInstanceMatrix3;
  
  // Per-instance texture coordinates (one for each vertex of the quad)
  attribute vec2 aInstanceTexCoord0;
  attribute vec2 aInstanceTexCoord1;
  attribute vec2 aInstanceTexCoord2;
  attribute vec2 aInstanceTexCoord3;
  
  uniform mat4 uModelViewMatrix;
  uniform mat4 uInstancedModelViewMatrix;
  uniform mat4 uProjectionMatrix;
  uniform bool useInstances;

  varying highp vec2 vTexCoord;
  varying vec2 vFragPos;
  
  void main() {
    // Construct the instance matrix
    mat4 instanceMatrix = mat4(
      aInstanceMatrix0,
      aInstanceMatrix1,
      aInstanceMatrix2,
      aInstanceMatrix3
    );
    
    // Apply the instance-specific transform, then the global transforms
    if(useInstances) {
        gl_Position = uProjectionMatrix * uInstancedModelViewMatrix * instanceMatrix * aVertexPosition;
        vFragPos = (uInstancedModelViewMatrix * instanceMatrix * aVertexPosition).xy;
        
        // Use per-instance texture coordinates based on vertex index
        // Vertex order: top-right, top-left, bottom-right, bottom-left
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
    uniform float uOpacity; // Global opacity multiplier per GameObject

    uniform vec2 uLightPosition[4]; // Support up to 4 lights
    uniform vec3 uLightColor[4];    // RGB colors for each light
    uniform float uLightIntensity[4]; // Intensity of each light
    uniform float uLightRadius[4];  // Radius of each light
    uniform int uActiveLights;      // Number of active lights
    
    // Directional lights
    uniform vec2 uDirLightPosition[4]; // Position of directional lights
    uniform vec2 uDirLightDirection[4]; // Direction of directional lights
    uniform vec3 uDirLightColor[4];    // RGB colors for each directional light
    uniform float uDirLightIntensity[4]; // Intensity of each directional light
    uniform float uDirLightWidth[4];   // Width of each directional light beam
    uniform int uActiveDirLights;      // Number of active directional lights
    
    uniform vec3 uAmbientLightValues; // Ambient light values
    uniform bool uUseLighting;      // Whether to apply lighting to this object

    varying vec2 vTexCoord;
    varying vec2 vFragPos;

    void main() {
        vec4 ambientLight = vec4(uAmbientLightValues.xyz, 1.0); // Move ambient light here
        
        vec4 texColor;
        if (useTexture) {
            texColor = texture2D(uSampler, vTexCoord);
            // Discard only fully or nearly fully transparent texels to keep soft edges
            if (texColor.a < 0.01) discard;
            // Apply color tint to texture
            texColor *= uColor;
        } else {
            texColor = uColor;
        }
        
        // Start with ambient light
        vec3 lighting = ambientLight.rgb;
        
        // Calculate contribution from each point light
        for(int i = 0; i < 4; i++) {
            if(i >= uActiveLights) break;
            
            float distance = length(uLightPosition[i] - vFragPos);
            
            // Check if fragment is within light radius
            if(distance < uLightRadius[i]) {
                // Calculate attenuation (falloff)
                float attenuation = 1.0 - distance / uLightRadius[i];
                
                // Add this light's contribution
                lighting += uLightColor[i] * attenuation * uLightIntensity[i];
            }
        }
        
        // Calculate contribution from each directional light
        for(int i = 0; i < 4; i++) {
            if(i >= uActiveDirLights) break;
            
            vec2 lightPos = uDirLightPosition[i];
            vec2 lightDir = normalize(uDirLightDirection[i]);
            vec2 toFrag = vFragPos - lightPos;
            
            // Check if fragment is in front of the light
            float projection = dot(toFrag, lightDir);
            if(projection < 0.0) continue;
            
            // Calculate perpendicular distance from light beam center
            float perpDistance = abs(dot(toFrag, vec2(-lightDir.y, lightDir.x)));
            
            // Check if fragment is within light beam width
            if(perpDistance > uDirLightWidth[i] * 0.5) continue;
            
            // Simplified lighting without shadows for now
            float widthFactor = 1.0 - (perpDistance / (uDirLightWidth[i] * 0.5));
            
            // Optional: Add distance attenuation
            float distance = length(toFrag);
            float maxDistance = 1000.0; // Maximum effective distance
            float distanceFactor = max(0.0, 1.0 - (distance / maxDistance));
            
            // Add this directional light's contribution
            lighting += uDirLightColor[i] * uDirLightIntensity[i] * widthFactor * distanceFactor;
        }
        
        // Apply lighting to texture color only if lighting is enabled
        vec4 outColor;
        if (uUseLighting) {
            outColor = vec4(texColor.rgb * lighting, texColor.a);
        } else {
            outColor = texColor;
        }
        // Apply global opacity multiplier
        outColor.a *= clamp(uOpacity, 0.0, 1.0);
        gl_FragColor = outColor;
    }
`;

export { STANDARD_VERTEX_SHADER, STANDARD_FRAGMENT_SHADER };
