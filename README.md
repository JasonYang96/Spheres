#CS174A Spring 2015 Assignment #2
* * * 
###Required code:
>1. This is a README and I have commented my code
>2. I implmented a canvas with the correct width and height requirements with `<canvas id="gl-canvas" width="960" height="540"></canvas>`. I then made the canvas black by calling `gl.clearColor( 0.0, 0.0, 0.0, 1.0 )`. Finally, I enabled z-buffer with `gl.enable(gl.DEPTH_TEST);`. I do not get any errors when running the application.
>3. I used my own function `planet()` to create a planet object. In this function I pass in a variable `n` which is the 2nd variable which determines how many times the tetrahedron function will subdivide. The tetrahedron function was provided by the book. However, I also added a shading parameter to differentiate between the different shading methods we had to implement.
>4. As said previously, my `planet()` function also passes in a shading paramater. This shading parameter is used to pass to the shaders as well as to the triangle function to determine which shading to use. I generate the normal vectors in my triangle function. For my project, 0 represented flat shading, 1 represented Gouraud shading, and 2 represented Phong shading.
>5. I create the planets and sun in the init function. I call my planets() functions with certain parameters for each planet. They each have different sizes as well as different dthetas, which represent how fast they orbit.
>6. I implemented the sun as the light source by using the ModelView matrix for the sun as the location of the light source. I then turned this matrix into a vec4 to be used correctly in the shader. I believe my sun is medium size compared to the planets so I colored my sun yellowish. I also commented in my code where I made each of the planets.
>7. The book suggested not to do light shading in the application so for flat and Gourand shading, I implemented the shading in the vertex shader. The code for these shadings are done in the `if(shading < 2)` bubble. However, if it was Phong shading, I implemented it in the fragment shader. Therefore, flat shading is implemented per primitive, Gourand per vertex, and Phong per fragment.
>8. I reused the keyboard navigation system from Assignment #1. However, I did not reimplement the 'C' key, nor the '+' key. My view is above the center of the sun looking down at a 30-degree angle as I rotated about the x-axis by 30 degrees. Lookat was not used!

###Extra-Credit
>1. The moon is the last "planet" pushed and uses the modelView matrix from the last planet. However, I added a translate and rotate function to implement the moon.
>2. I used the 'S' key to denote wanting to attach to a planet. Pressing this key would attach to the muddy planet. I also did some vector math to achieve the correct heading angle when attached to a planet. The math for this can be found in the `if(swag)` bubble.
>3. Yes, implemeted using the GitHub repository.
>4. Submitted on Monday 4/27/2015.