# SGI 2022/2023 - TP1

## Group: T02G07

| Name             | Number    | E-Mail               |
| ---------------- | --------- | ------------------   |
| Duarte Sardão    | 201905497 | up201905497@fe.up.pt |
| Tomás Torres     | 201800700 | up201800700@fe.up.pt |

----
## Project information

- Everything in specifications done (graph, transformations, textures, lights, cameras, materials, interface)
- Scene with varied elements to show the implementation of the specifications
- We also did turned MyRectangle into a grid of rectangles, so lighting effects (specifically spotlights) would be clearly visible.
- Scene
  - The scene is composed of a tiled area, with a counter with a sink, oven, a table with a bowl/plate with fruits and a plate with a cake and a triangular stool.
  - [Scene screenshots](/scenes/screenshots)

  ![Test](/scenes/screenshots/version2.png)

----
## Issues/Problems

- The rectangle grids are particularly inneficient, as every pixel is repeated 4 times (except those on the outer edges and corners).
