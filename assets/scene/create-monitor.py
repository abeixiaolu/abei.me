import bpy, math, random
from mathutils import Vector
random.seed(10)
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
def material(name, color, rough=.6, metallic=0):
 m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True; p=m.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value=(*color,1); p.inputs['Roughness'].default_value=rough; p.inputs['Metallic'].default_value=metallic; return m
plastic=material('Aged warm ABS',(.053,.054,.040),.60); face=material('Faceplate',(.044,.047,.036),.43); gasket=material('Screen rubber',(.005,.007,.006),.92); trim=material('Inner bezel',(.009,.012,.010),.30); dark=material('Buttons',(.037,.044,.034),.40); metal=material('Brushed fasteners',(.19,.205,.18),.27,.85); ink=material('Printed markings',(.451,.43,.32),.85); led=material('Power LED',(.29,.64,.25),.3)
def cube(name, loc, scale, mat, bevel=.025):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc); o=bpy.context.object; o.name=name; o.dimensions=scale; bpy.ops.object.transform_apply(location=False,rotation=False,scale=True); o.data.materials.append(mat)
 for poly in o.data.polygons: poly.use_smooth=True
 if bevel:
  mod=o.modifiers.new('Moulded edge radii','BEVEL'); mod.width=bevel; mod.segments=4
  mod=o.modifiers.new('Weighted corner normals','WEIGHTED_NORMAL'); mod.keep_sharp=True
 return o
def cyl(name,loc,r,depth,mat):
 bpy.ops.mesh.primitive_cylinder_add(vertices=32,radius=r,depth=depth,location=loc,rotation=(math.pi/2,0,0)); o=bpy.context.object;o.name=name;o.data.materials.append(mat);
 for poly in o.data.polygons: poly.use_smooth=True
 b=o.modifiers.new('Edge radius','BEVEL');b.width=.008;b.segments=3;o.modifiers.new('Normals','WEIGHTED_NORMAL');return o
# Dimensions match the runtime monitor; front faces towards negative Blender Y.
cube('CRT rear housing', (0,.65,2.18),(4.5,1.35,3.4),plastic,.17)
cube('Front moulding',(0,-.045,2.18),(4.43,.22,3.32),face,.12)
cube('Bezel gasket',(0,-.17,2.4),(3.99,.07,2.63),gasket,.11)
cube('Bezel inner rim',(0,-.213,2.4),(3.83,.045,2.47),trim,.09)
# Screen is rendered separately by Three.js on the front plane.
cube('Pedestal neck',(0,.55,.43),(2.25,.9,.22),plastic,.09)
cube('Pedestal foot',(0,.55,.29),(2.95,1.35,.13),face,.09)
for i in range(16): cube('Speaker vent %02d'%i,(-1.83+i*.075,-.173,1.02),(.026,.018,.10),gasket,.008)
for side in [-1,1]:
 for i in range(20): cube('Side vent %d %d'%(side,i),(side*2.251,.18+i*.05,2.0),(.012,.026,.56),gasket,.005)
cube('Rectangular power rocker',(-1.77,-.194,.69),(.15,.07,.20),dark,.018)
cube('Power rocker highlight',(-1.77,-.233,.72),(.09,.009,.045),ink,.003)
for i in range(5):
 x=-1.35+i*.32
 cube('Input selector %d'%i,(x,-.196,.72),(.19,.07,.10),dark,.012)
 cube('Selector top highlight %d'%i,(x,-.234,.765),(.13,.005,.007),metal,.002)
for i in range(2):
 cyl('Front input socket %d'%i,(.36+i*.21,-.19,.72),.053,.035,metal)
 cyl('Input socket recess %d'%i,(.36+i*.21,-.211,.72),.030,.01,gasket)
for i in range(4):
 x=1.14+i*.2; cyl('Control button %d'%i,(x,-.18,.69),.068,.045,dark); cyl('Button highlight %d'%i,(x,-.207,.69),.042,.01,metal)
cyl('Status lamp',(.88,-.19,.69),.024,.025,led)
for x in [-2.02,2.02]: cyl('Case screw',(x,-.176,.63),.025,.015,metal)
# silk-screened markings remain separate editable objects
for text,loc,size in [('ABEI',(-1.95,-.18,3.75),.065),('PRECISION COLOR',(1.0,-.18,3.75),.035),('POWER',(-1.9,-.18,.53),.039),('INPUT 1     INPUT 2     RGB     MENU',(-1.46,-.18,.57),.035),('VIDEO  AUDIO',(.23,-.18,.57),.034),('BRIGHT   CONTRAST',(1.1,-.18,.53),.033)]:
 bpy.ops.object.text_add(location=loc,rotation=(math.pi/2,0,0)); o=bpy.context.object;o.name='Marking '+text;o.data.body=text;o.data.size=size;o.data.extrude=.0003;o.data.materials.append(ink)
# Native file retains modifiers and components.
bpy.ops.wm.save_as_mainfile(filepath='/Users/abei/i/abei.me/assets/scene/monitor.blend')
bpy.ops.export_scene.gltf(filepath='/Users/abei/i/abei.me/src/public/models/monitor.glb',export_format='GLB',export_apply=True)
