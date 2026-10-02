# Time Tactics GDD

**Description:** Tactical action/puzzle game. The player controls a squad of soldiers to complete an objective on a top down 2.5D map (similar to frozen synapse). Everything moves in real time, no turns. However the player has limited access to a pause button that allows them to assign commands to the squad while paused.   
**Platform:** Mobile (portrait mode)

### Prototype specifications

#### Theme

Science fiction  
Minimalistic/stylish similar to Frozen Synapse  
Map and obstacles are white with gray shadows  
Enemy is red  
Player character is blue

#### Level design

Large room with multiple obstacles (boxes)  
Grid based (future level designer will be grid based placement of walls and obstacles)  
Obstacles can be full height or half height  
5 enemies

#### Enemies

Enemies have assault rifles  
Set patrol paths  
Each enemy has own cone of vision  
Shoots any player character within their cone of vision, then continue on path  
Status is walk, look in direction of walk. 

#### Player character

3 HP  
Has assault rifle  
Automatically shoots anything in their cone of vision unless running

#### Game screen

Map fills the screen  
Map is zoomable and scrollable  
Large pause/play button on bottom center of screen

#### Player control

Clicking on player character will open a circular selection menu around the player  
The selections are

| Command | Description | Control | Accuracy |
| :---- | :---- | :---- | :---- |
| Walk (aim) | Walk and aim in a specified direction | Click on location to walk to, then drag to confirm direction to aim at | 50% |
| Crouch/Stand | Changes the height of player, crouched player can hide behind half height obstacles.  | Clicking on the selection changes toggles the crouch/stand. If was running, crouching changes it to a walk with the same destination | Adds 10% to accuracy |
| Wait (overwatch) | Does not move | Hold and drag to confirm direction of aim | 80% |
| Run | Moves at double speed relative to walk, cannot shoot. Cone of vision is directly ahead | Click on destination to run to | Cannot fire while running |
| Throw | Throws a smoke grenade | Click and drag to throw grenade. Limited range. Can throw over half height obstacles. Enemies in effected area has very limited cone of vision | N/A |

Accuracy is also affected by distance to target and shoot priority

**Shoot priority (who fires first)**  
Overwatch(crouch)-\>Overwatch(stand)-\>Walk(crouch)-\>Walk(stand)

Being shot at automatically faces the player to the shooter, movement is maintained

