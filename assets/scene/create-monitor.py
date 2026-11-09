from pathlib import Path
import bpy
import math
import random
import numpy as np
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
ASSETS = ROOT / 'assets/scene'
REVIEWS = ASSETS / 'reviews'
REVIEWS.mkdir(exist_ok=True)
random.seed(27)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for block in list(bpy.data.materials):
    bpy.data.materials.remove(block)

MATERIALS = {}
PARTS = []

def rgb(hex_color):
    values = [int(hex_color[i:i+2], 16) / 255 for i in (0, 2, 4)]
    return tuple(v / 12.92 if v < .04045 else ((v + .055) / 1.055) ** 2.4 for v in values)

def material(name, color, roughness=.6, metalness=0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (*rgb(color), 1)
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Metallic'].default_value = metalness
    mat.diffuse_color = (*rgb(color), 1)
    MATERIALS[name] = mat
    return mat

def image(name, values, colorspace):
    height, width = values.shape[:2]
    img = bpy.data.images.new(name, width=width, height=height, alpha=True)
    img.colorspace_settings.name = colorspace
    img.pixels.foreach_set(values.astype(np.float32).ravel())
    img.filepath_raw = str(ASSETS / ('computer-' + name + '.png'))
    img.file_format = 'PNG'
    img.save()
    img.pack()
    return img

def image_node(mat, img):
    node = mat.node_tree.nodes.new('ShaderNodeTexImage')
    node.image = img
    node.interpolation = 'Linear'
    node.extension = 'REPEAT'
    return node

size = 1024
rng = np.random.default_rng(27)
yy, xx = np.mgrid[0:size, 0:size]
fine = rng.normal(0, 1, (size, size))
broad = .5 * np.sin(xx * .012) * np.cos(yy * .009) + .3 * np.sin((xx + yy) * .021)
base = np.empty((size, size, 4))
for channel, value in enumerate((216 / 255, 209 / 255, 173 / 255)):
    base[:, :, channel] = np.clip(value * (1 + broad * .018 + fine * .003), 0, 1)
base[:, :, 3] = 1
albedo = image('ivory-albedo', base, 'sRGB')
rough = np.ones((size, size, 4))
rough[:, :, :3] = np.clip(.64 + broad[:, :, None] * .035 + fine[:, :, None] * .014, 0, 1)
roughness = image('ivory-roughness', rough, 'Non-Color')
normal = np.ones((size, size, 4))
grain = rng.normal(0, .018, (size, size))
normal[:, :, 0] = .5 + np.gradient(grain, axis=1)
normal[:, :, 1] = .5 + np.gradient(grain, axis=0)
normal[:, :, 2] = 1
normalmap = image('ivory-normal', normal, 'Non-Color')

ivory = material('Ivory ABS / fine molded grain', 'd8d1ad', .64)
bsdf = ivory.node_tree.nodes.get('Principled BSDF')
bsdf.inputs['Base Color'].default_value = (1, 1, 1, 1)
ivory.node_tree.links.new(image_node(ivory, albedo).outputs['Color'], bsdf.inputs['Base Color'])
ivory.node_tree.links.new(image_node(ivory, roughness).outputs['Color'], bsdf.inputs['Roughness'])
normal_node = ivory.node_tree.nodes.new('ShaderNodeNormalMap')
normal_node.inputs['Strength'].default_value = .23
ivory.node_tree.links.new(image_node(ivory, normalmap).outputs['Color'], normal_node.inputs['Color'])
ivory.node_tree.links.new(normal_node.outputs['Normal'], bsdf.inputs['Normal'])
bezel = material('Warm satin bezel', 'c9c2a1', .42)
bezel.node_tree.links.new(image_node(bezel, normalmap).outputs['Color'], (bezel_normal := bezel.node_tree.nodes.new('ShaderNodeNormalMap')).inputs['Color'])
bezel_normal.inputs['Strength'].default_value = .15
bezel.node_tree.links.new(bezel_normal.outputs['Normal'], bezel.node_tree.nodes.get('Principled BSDF').inputs['Normal'])
seam = material('Panel seams and vent interiors', '32342c', .91)
keymat = material('Graphite keycaps / satin ABS', '4d4f49', .48)
keymat.node_tree.links.new(image_node(keymat, normalmap).outputs['Color'], (key_normal := keymat.node_tree.nodes.new('ShaderNodeNormalMap')).inputs['Color'])
key_normal.inputs['Strength'].default_value = .15
keymat.node_tree.links.new(key_normal.outputs['Normal'], keymat.node_tree.nodes.get('Principled BSDF').inputs['Normal'])
legend = material('Warm white key legends', 'e3dfca', .58)
steel = material('Brushed badge aluminum', 'a9a58e', .34, .7)
black = material('Black rubber feet', '171b18', .85)
recess = material('Keyboard well', '292b26', .8)
led = material('Power indicator green glass', '40895e', .27)
led.node_tree.nodes.get('Principled BSDF').inputs['Emission Color'].default_value = (*rgb('40895e'), 1)
led.node_tree.nodes.get('Principled BSDF').inputs['Emission Strength'].default_value = .5


def finish(obj, mat, bevel=0):
    obj.data.materials.append(mat)
    if bevel:
        mod = obj.modifiers.new('Molded edge radius', 'BEVEL')
        mod.width = bevel
        mod.segments = 3
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    normal_mod = obj.modifiers.new('Face weighted normals', 'WEIGHTED_NORMAL')
    normal_mod.keep_sharp = True
    PARTS.append(obj)
    return obj

def box(name, loc, dimensions, mat, bevel=.015, rotation=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = dimensions
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if rotation:
        obj.rotation_euler = rotation
    return finish(obj, mat, bevel)

def mesh(name, vertices, faces, mat, bevel=0):
    data = bpy.data.meshes.new(name)
    data.from_pydata(vertices, [], faces)
    data.update()
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.normals_make_consistent(inside=False)
    bpy.ops.uv.smart_project(angle_limit=math.radians(70), island_margin=.02)
    bpy.ops.object.mode_set(mode='OBJECT')
    obj.select_set(False)
    return finish(obj, mat, bevel)

def rounded_rect(width, height, radius, center_x=0, center_z=0):
    result = []
    for cx, cz, angle in [(width/2-radius, height/2-radius, 0), (-width/2+radius, height/2-radius, 90), (-width/2+radius, -height/2+radius, 180), (width/2-radius, -height/2+radius, 270)]:
        for step in range(9):
            a = math.radians(angle + step * 90 / 8)
            result.append((center_x + cx + radius * math.cos(a), center_z + cz + radius * math.sin(a)))
    return result

def ring(name, sections, mat, bevel=0, cap=False):
    vertices = [(x, depth, z) for width, height, radius, cx, cz, depth in sections for x, z in rounded_rect(width, height, radius, cx, cz)]
    count = 36
    faces = []
    for section in range(len(sections)-1):
        for i in range(count):
            j = (i+1) % count
            faces.append((section*count+i, section*count+j, (section+1)*count+j, (section+1)*count+i))
    if cap:
        faces.append(tuple(range((len(sections)-1)*count, len(sections)*count)))
    return mesh(name, vertices, faces, mat, bevel)


def text(name, body, loc, size, mat, rotation=(math.pi/2, 0, 0), align='CENTER'):
    bpy.ops.object.text_add(location=loc, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    obj.data.body = body
    obj.data.size = size
    obj.data.align_x = align
    obj.data.align_y = 'CENTER'
    obj.data.extrude = .0003
    obj.data.resolution_u = 5
    obj.data.materials.append(mat)
    PARTS.append(obj)
    return obj

slope = .285
angle = math.atan(slope)
def top(y):
    return min(1.17, .515 + (y+2.3)*slope)

vertices = []
for x in [-1.975, 1.975]:
    vertices += [(x,-2.3,.30),(x,1.55,.30),(x,1.55,1.17),(x,0,1.17),(x,-2.3,.515)]
faces = [(0,4,3,2,1),(5,6,7,8,9)] + [(i,(i+1)%5,(i+1)%5+5,i+5) for i in range(5)]
base_case = mesh('Apple II upper wedge enclosure', vertices, faces, ivory)
cut = box('Keyboard cavity cutting tool', (0,-1.475,top(-1.475)+.10), (3.18,1.36,.42), recess, .055, (angle,0,0))
PARTS.remove(cut)
bpy.context.view_layer.objects.active = cut
bpy.ops.object.modifier_apply(modifier='Molded edge radius')
mod = base_case.modifiers.new('Inset keyboard cavity', 'BOOLEAN')
mod.operation = 'DIFFERENCE'
mod.solver = 'EXACT'
mod.object = cut
base_case.modifiers.move(len(base_case.modifiers)-1, 0)
bev = base_case.modifiers.new('Molded enclosure corners','BEVEL')
bev.width = .095
bev.segments = 5
base_case.modifiers.move(len(base_case.modifiers)-1, 0)
cut.hide_render = True
cut.hide_set(True)
box('Lower case seam', (0,-.375,.317), (3.89,3.75,.055), seam, .07)
box('Apple II lower enclosure', (0,-.375,.287), (3.90,3.75,.075), bezel, .04)
for x in [-1.64,1.64]:
    for y in [-1.92,1.15]:
        box('Non slip rubber foot', (x,y,.255), (.27,.32,.03), black, .025)
box('Recessed keyboard mounting tray', (0,-1.475,top(-1.475)-.080), (3.13,1.29,.055), recess, .035, (angle,0,0))

for side in [-1,1]:
    for i in range(22):
        y = -.24 + i*.066
        box(f'Computer side vent {side} {i:02}', (side*1.977,y,.926), (.009,.025,.24), seam, .004)
    box(f'Computer lid seam {side}', (side*1.60,-.34,top(-.34)+.007), (.009,.83,.006), seam, .002, (angle,0,0))

rows = [
    [('1','!',1),('2','"',1),('3','#',1),('4','$',1),('5','%',1),('6','&',1),('7',"'",1),('8','(',1),('9',')',1),('0','',1),(':','*',1),('-','=',1),('RESET','',1.1)],
    [('ESC','',1.15),('Q','',1),('W','',1),('E','',1),('R','',1),('T','',1),('Y','',1),('U','',1),('I','',1),('O','',1),('P','',1),('REPT','',1),('RETURN','',1.2)],
    [('CTRL','',1.3),('A','',1),('S','',1),('D','',1),('F','',1),('G','',1),('H','',1),('J','',1),('K','',1),('L','',1),(';','+',1),('←','',1),('→','',1.05)],
    [('SHIFT','',1.65),('Z','',1),('X','',1),('C','',1),('V','',1),('B','',1),('N','',1),('M','',1),(',','<',1),('.','>',1),('/','?',1),('SHIFT','',1.7)],
]
unit = .216
step_y = .225

def keycap(name, x, y, width, main, alternate, mat=keymat):
    z = top(y)-.020
    rings = [(-.070,width,.201),(.035,width-.019,.185),(.071,width-.055,.153)]
    vertices = []
    n = 36
    for height,w,d in rings:
        for px,py in rounded_rect(w,d,.022):
            vertices.append((px,py,height))
    faces = []
    for level in range(2):
        for i in range(n):
            j=(i+1)%n
            faces.append((level*n+i,level*n+j,(level+1)*n+j,(level+1)*n+i))
    center = len(vertices)
    vertices.append((0,0,.057))
    for i in range(n):
        faces.append((2*n+i,2*n+(i+1)%n,center))
    faces.append(tuple(reversed(range(n))))
    obj=mesh(name,vertices,faces,mat,.004)
    obj.location=(x,y,z)
    obj.rotation_euler.x=angle
    if main:
        font_size=.060 if len(main)==1 else .030
        local_y = -.021 if alternate else .006
        world_y = y+local_y*math.cos(angle)-.074*math.sin(angle)
        world_z = z+local_y*math.sin(angle)+.074*math.cos(angle)
        text(name+' legend',main,(x,world_y,world_z),font_size,legend,(angle,0,0))
    if alternate:
        local_y=.045
        world_y=y+local_y*math.cos(angle)-.078*math.sin(angle)
        world_z=z+local_y*math.sin(angle)+.078*math.cos(angle)
        text(name+' alternate',alternate,(x,world_y,world_z),.031,legend,(angle,0,0))

for row_idx,row in enumerate(rows):
    widths=[item[2]*unit for item in row]
    total=sum(widths)+.012*(len(row)-1)
    x=-total/2
    y=-.94-row_idx*step_y
    for key_idx,((main,alternate,_),width) in enumerate(zip(row,widths)):
        keycap(f'Key {row_idx+1} {key_idx+1:02} {main}',x+width/2,y,width,main,alternate)
        x+=width+.012
keycap('Space bar',0,-1.87,1.82,'','')
keycap('Ivory power key',-1.405,-1.87,.22,'','',ivory)
box('Keyboard power lens',(-1.405,-1.91,top(-1.87)+.058),(.037,.025,.008),led,.003,(angle,0,0))

ring('CRT tapered rear housing',[(3.62,2.68,.11,0,2.52,-.35),(3.62,2.68,.12,0,2.52,-.16),(3.28,2.43,.20,0,2.52,1.37),(3.18,2.33,.20,0,2.52,1.47)],ivory,.013,True)
ring('CRT front enclosure face',[(3.62,2.68,.11,0,2.52,-.35),(3.62,2.68,.11,0,2.52,-.405),(3.23,2.45,.06,-.085,2.50,-.421)],ivory,.008)
ring('Bezel dark separation',[(3.25,2.47,.065,-.085,2.50,-.428),(3.19,2.41,.060,-.085,2.50,-.431)],seam)
ring('Inset beveled display surround',[(3.18,2.40,.055,-.085,2.50,-.435),(3.16,2.38,.060,-.085,2.50,-.473),(2.91,2.21,.075,0,2.50,-.475),(2.66,2.04,.13,0,2.50,-.299)],bezel,.008)
ring('Screen glass seating gasket',[(2.675,2.055,.13,0,2.50,-.299),(2.625,2.005,.12,0,2.50,-.297)],seam)
for x in [-1.40,1.40]:
    box('CRT rubber support pad',(x,.45,1.18),(.40,1.12,.028),black,.014)
for side in [-1,1]:
    for i in range(15):
        y=.11+i*.072
        x=side*(1.81-(y+.16)*.11+.002)
        box(f'CRT cooling slot {side} {i:02}',(x,y,2.25),(.012,.023,.60),seam,.005)
    box(f'CRT case joint {side}',(side*1.813,-.17,2.52),(.009,.013,2.35),seam,.002)
for i in range(18):
    box(f'Top ventilation slot {i:02}',(-.94+i*.11,1.03,3.742),(.055,.33,.009),seam,.008)

box('Control rail seam',(1.525,-.421,2.50),(.008,.008,2.43),seam,.001)
box('Power switch recess',(1.665,-.451,3.69),(.205,.046,.12),seam,.014)
box('Power rocker ivory',(1.665,-.487,3.69),(.164,.058,.087),bezel,.012)
box('Green power window',(1.665,-.519,3.708),(.058,.007,.024),led,.004)
for z,label in [(3.52,'◐'),(2.45,'◑')]:
    box('Recessed adjustment control',(1.663,-.432,z),(.128,.018,.128),bezel,.015)
    bpy.ops.mesh.primitive_torus_add(major_radius=.040,minor_radius=.0025,major_segments=32,minor_segments=6,location=(1.663,-.444,z),rotation=(math.pi/2,0,0))
    obj=bpy.context.object
    obj.name='Embossed display control ring'
    finish(obj,ivory)
    box('Embossed control symbol',(1.663,-.445,z),(.006,.004,.066),ivory,.001)
for z in [1.36,3.64]:
    box('Molded alignment mark',(0,-.479,z),(.13,.004,.055),ivory,.002)
    text('Alignment symbol','↔',(0,-.482,z),.045,bezel)

colors=['66a859','e6bc42','e29437','c34a4c','8f5c96','4d94ba']
stripe_mats=[material('Rainbow badge '+str(i),color,.36,.15) for i,color in enumerate(colors)]

def badge(name,loc,scale=1,rotation=(math.pi/2,0,0)):
    parent=bpy.data.objects.new(name,None)
    bpy.context.collection.objects.link(parent)
    parent.location=loc
    parent.rotation_euler=rotation
    contour=[(-.02,.105),(-.068,.122),(-.108,.099),(-.123,.055),(-.121,.003),(-.101,-.060),(-.069,-.105),(-.025,-.109),(0,-.094),(.032,-.109),(.073,-.104),(.110,-.048),(.079,-.030),(.068,.002),(.079,.035),(.112,.054),(.095,.094),(.054,.118),(.016,.112)]
    def clip(poly, bound, keep_above):
        result=[]
        for i,a in enumerate(poly):
            b=poly[(i+1)%len(poly)]
            inside_a=a[1]>=bound if keep_above else a[1]<=bound
            inside_b=b[1]>=bound if keep_above else b[1]<=bound
            if inside_a: result.append(a)
            if inside_a != inside_b:
                t=(bound-a[1])/(b[1]-a[1])
                result.append((a[0]+t*(b[0]-a[0]),bound))
        return result
    for i,mat in enumerate(stripe_mats):
        hi=.123-i*.039
        lo=hi-.039
        points=clip(clip(contour,lo,True),hi,False)
        obj=mesh(name+' stripe '+str(i),[(x*scale,y*scale,.002) for x,y in points],[tuple(range(len(points)))],mat)
        obj.parent=parent
    leaf=mesh(name+' leaf',[(.005*scale,.124*scale,.002),(.046*scale,.164*scale,.002),(.048*scale,.135*scale,.002),(.020*scale,.118*scale,.002)],[(0,1,2,3)],stripe_mats[0])
    leaf.parent=parent
    return parent

box('Monitor rainbow badge plate',(1.66,-.432,1.43),(.19,.015,.19),steel,.013)
badge('Monitor rainbow badge',(1.665,-.444,1.41),.64)
box('Computer nameplate',(0,-.43,top(-.43)+.015),(1.08,.275,.027),steel,.025,(angle,0,0))
badge('Apple II rainbow badge',(-.405,-.45,top(-.43)+.031),.8,(angle,0,0))
text('Apple II raised logotype','apple ][',(.125,-.434,top(-.43)+.043),.155,legend,(angle,0,0))
badge('Left housing rainbow badge',(-1.814,.17,2.74),.82,(math.pi/2,0,-math.pi/2))

glass=material('Preview dark CRT glass','283437',.16)
glass.node_tree.nodes.get('Principled BSDF').inputs['Coat Weight'].default_value=.4
points=[]
faces=[]
nu,nv=48,36
for j in range(nv+1):
    v=-1+2*j/nv
    for i in range(nu+1):
        u=-1+2*i/nu
        points.append((u*1.31,-.31-.045*(1-u*u)*(1-v*v),2.50+v))
for j in range(nv):
    for i in range(nu):
        k=j*(nu+1)+i
        faces.append((k,k+1,k+nu+2,k+nu+1))
preview=mesh('Preview CRT glass',points,faces,glass)
PARTS.remove(preview)

scene=bpy.context.scene
scene.unit_settings.system='METRIC'
scene['runtime_screen']={'width':2.62,'height':2.00,'cornerRadius':.12,'x':0.0,'y':2.50,'z':.31}
scene['authoring_coordinates']='Blender +Z up, -Y front. glTF uses (x,z,-y). Runtime placement is identity.'
scene['reference_note']='Front appearance follows supplied photograph. Hidden rear vents and sockets are inferred.'
scene.render.engine='CYCLES'
scene.cycles.samples=48
scene.cycles.use_denoising=True
scene.render.resolution_x=1100
scene.render.resolution_y=1100
scene.render.resolution_percentage=100
scene.view_settings.view_transform='AgX'
scene.world.color=(.16,.16,.16)
for name,loc,energy,light_size,color in [('Large softbox',(-4.5,-5,7),850,4.5,(1,.95,.85)),('Cool fill',(4,-1,5),520,3.5,(.80,.88,1)),('Top rim',(1,4,6),900,3,(1,.96,.88))]:
    data=bpy.data.lights.new(name,'AREA')
    data.energy=energy
    data.shape='DISK'
    data.size=light_size
    data.color=color
    obj=bpy.data.objects.new(name,data)
    scene.collection.objects.link(obj)
    obj.location=loc
    obj.rotation_euler=(Vector((0,0,2))-obj.location).to_track_quat('-Z','Y').to_euler()
backdrop=box('Preview floor',(0,0,.17),(200,200,.10),material('Preview charcoal floor','25292b',.8),0)
PARTS.remove(backdrop)
bpy.ops.object.camera_add(location=(5.5,-8.7,6.0))
camera=bpy.context.object
camera.name='Inspection camera'
camera.data.type='ORTHO'
camera.data.ortho_scale=5.85
camera.rotation_euler=(Vector((0,-.25,2.0))-camera.location).to_track_quat('-Z','Y').to_euler()
scene.camera=camera

bpy.ops.object.select_all(action='DESELECT')
for obj in PARTS:
    obj.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(ROOT/'src/public/models/monitor.glb'),export_format='GLB',export_apply=True,use_selection=True,export_image_format='AUTO',export_texcoords=True,export_normals=True)
bpy.ops.wm.save_as_mainfile(filepath=str(ASSETS/'monitor.blend'))
scene.render.filepath=str(REVIEWS/'apple-computer-three-quarter.png')
bpy.ops.render.render(write_still=True)
camera.location=(-5.5,-8.7,6.0)
camera.rotation_euler=(Vector((0,-.25,2.0))-camera.location).to_track_quat('-Z','Y').to_euler()
scene.render.filepath=str(REVIEWS/'apple-computer-left.png')
bpy.ops.render.render(write_still=True)
camera.location=(2.7,-5.0,5.6)
camera.rotation_euler=(Vector((0,-1.15,.8))-camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.ortho_scale=4.2
scene.render.filepath=str(REVIEWS/'apple-computer-keyboard.png')
bpy.ops.render.render(write_still=True)
print('COMPUTER_ASSET',len(PARTS),'parts',len(MATERIALS),'materials', 'screen 2.62 x 2.00 at (0,2.50,.31)')
