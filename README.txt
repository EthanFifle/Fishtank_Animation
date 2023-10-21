This project was a group effort.

Team members include:
Ethan Fifle, Student number: 217016791
Geral Ikem, Student number:

To compile and run all you need to do is:
    1. extract the zip file
    2. open the project in any IDE
    3. launch the html page in a local browser/local host
    4. Toggle the animation

Implemented successfully: We have managed to implement all required aspects successfully
    (a) You have to use real time to synchronize your animations. (2 Marks).
    (b) Ground box, 2 (Marks).
    (c) Two rocks (spheres), (4 Marks).
    (d) Seaweed modeling: each strand has 10 ellipses. (4 Marks)
    (e) Seaweed animation (4 Marks).
    (f) Seaweed positioning (3 strands) (3 Marks).
    (g) Fish modeling: 2 eyes with pupils, 1 head, 1 body, 2 tail fins, (6 Marks).
    (h) Fish animation: The fish must swim in a circle around the seaweed. It should
        always be aligned with the tangent of the circle. (4 Marks).
    (i) A burst of 4-5 bubbles should appear every few seconds. (4 Marks).
    (j) Each bubble should appear near the mouth of the character (2 Marks).
    (k) The shape of each bubble should oscillate with time. (2 Marks).
    (l) Each bubble should move straight up with time. (2 Marks).
    (m) Each bubble should be removed/deleted after approximately 12 seconds. (1 Mark).
    (n) Model a human character with no arms. (4 Marks).
    (o) The character should move in the x and y world directions. (2 Marks).
    (p) The legs of the character should kick (hips, knees) as shown in the video. (4
        Marks). The feet do not move.
    (q) You do not have to match the exact motion or dimensions of the objects shown in
        the sample executable. However, your scene and the sample one should be
        qualitatively and visually similar (4 Marks).
    (r) Programming style (comments, functions) (2 Marks).

Each element will be described in sections that correspond to comments (section headers) in the code.

Here is an overview:
*** Note some elements are repeated in section, this is because functions were used in certain section to help
    animate, transform, position etc. certain objects, vectors, matrix etc. ***

    (a) - is commented thought the code
    (m) - is found on lines 261-269 where resetInterval = 12.0 for 12 seconds
    (q) - should be visually similar upon startup of the html
    (r) - all code and reasons are commented sufficiently and well organized

    Useful Functions -> Describe -> (d), (e), (i), (j), (k), (l), (o)
    Scene Set Up     -> Describe -> (b), (c)
    Ellipse Code     -> Describe -> (d), (e), (f)
    Human Body Code  -> Describe -> (i), (j), (l), (n), (o), (p)
    Fish Body Code   -> Describe -> (g), (h)

    Each section in the overview is described below as well as in the comments in created detail

/*** Comments on the "Useful Functions" Section ***/

This section of the code is where we store our useful functions that are utilized through the code
   - These function help truncate the code and reduce repeated code
   - Functions include;

     setRotation(time, a, b, frq)
        - Sets the rotation angle a & b such that the object rotates a < obj < b
          Also set the speed (in terms of frequency) between oscillations

     function setTranslation( time, speed, distance )
        - sets the translation speed and distance
        - uses Math.cos for this speed=velocity for the movement, distance = the amount of units traveled

     function drawEllipse( time, a, b, frq, sine )
        -  Draws an ellipse relative to the previous one when called in a hierarchical chain (recursive)
           values a, b & sine are used to animate motion from each individual call

     function ellipseHierarchy(level, sine, drift, theta)
        - Recursive function for drawing & manipulating ellipses
        - level: number of ellipses drawn after the "base"
        - sine: to start in +ve or -ve direction
        - drift: to set a "realistic" current drift
        - theta: to set a larger range of angles

     function drawBubbles( time )
        - Used to draw "groups" of 4 bubbles
        - Is called in a hierarchical manner within the head of the human

     function drawBubbleHierarchy(level, oscillation, velocity, x_base, y_base, time)
        - level: number of bubbles after the base
        - oscillation: used to oscillate the bubbles from side to die in the x direction
        - velocity: speed of the bubbles with respect to the elapsed time in the vertical direction
        - x_base: to keep track of the basis (base) bubble position in the x, so we can translate to draw all bubbles in the same x position
        - y_base: to keep track of the basis (base) bubble position in the y, so we can translate to draw all bubbles in the same y position
        - time: the elapsed time between intervals of 16 seconds

/*** Comments on the "Scene Set Up" Section ***/

Here is where we set up the majority of the scene including:
    The Larger rock
    The smaller rock &
    The ground

We choose to keep gTranslate(-4,0,0) ; from the template code as we found it helps center the WCS to the screen

/*** Comments on the "Ellipse Code" Section ***/

Here is where we set up the positions of each initial ellipse basis, insuring they are position correctly on the rock
You will notice that the animations of the ellipses are slightly different from the example, this is because we believe that the animations
in our version are an improvement to the ones in the example.

    - Each Ellipse animation differs slightly for aesthetic but the movement is EXACTLY the same as the call to/implementation of
      ellipseHierarchy(), drawEllipse(), & setRotation() do not change. Please do doc marks for "three seaweed strands are identical
      and move exactly the same way", they do just with different values on purpose in the calls to ellipseHierarchy( ... )

    - Each ellipse also now rotates in the x & z axis on the point of rotation. We omitted the y-axis rotations becase we do not yet
      know how to deal with collisions.

/*** Comments on the "Human Body Code" Section ***/

Here we found that the easiest way to create the human was to have a hierarchy between the body and the head, and the body and the legs.

    Head is in relation to the body

    Bubbles are in a hierarchy to the head:
        - Each group of bubbles are called using drawBubbles( time ) from earlier
        - A group of bubbles is in a hierarchical from in relation to its base bubble

    Upper legs (quads) are in relation to the body

    Lower legs (shins) are in a hierarchy in relation to the upper legs (quads)
        - We found that it was easier to first "undo" the scaling on the base cube done by the body as it
          messed up our rotations.

/*** Comments on the "Fish Body Code" Section ***/

Here is where our fish body code lies. We have made a couple improvements upon the example which I will shar here.

    First improvement:
        The fish body (cone) & all related cones are now initialized with 18 "triangles" as opposed to the original n
        This makes the fish look more "fluid" / graphic, it does come at a buffer cost though when many camera translations are used

    Second improvement:
        The fishtail is now composed of 4 cones, 1 Top fin, 1 Bottom fin, 1 Center fin & 1 Body union component
        the Top fin & Bottom fin preform as described in the assignment.
            - The center fin acts as a filler for the holes created by the top & bottom cones - purely for aesthetic
            - The body union component blends the tail more seamlessly into the fishes body for more realistic movement.
              This is best observed at camera position (90,0,0)
