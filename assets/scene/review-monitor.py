import bpy
from mathutils import Vector
from pathlib import Path
root=Path('/Users/abei/i/abei.me')
bpy.ops.wm.open_mainfile(filepath=str(root/'assets/scene/monitor.blend'))
scene=bpy.context.scene
scene.render.engine='CYCLES'
scene.cycles.samples=32
scene.cycles.use_denoising=True
scene.render.resolution_x=800
scene.render.resolution_y=800
scene.render.resolution_percentage=100
scene.world.color=(.22,.22,.22)
for name,loc,power,size,color in [('warm key',(-4,-5,6),650,4,(1,.81,.61)),('cool rim',(4,2,6),900,3,(.65,.79,1))]:
 data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='DISK';data.size=size;data.color=color
 obj=bpy.data.objects.new(name,data);scene.collection.objects.link(obj);obj.location=loc;obj.rotation_euler=(Vector((0,0,2))-obj.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(5.7,-9,4.7))
camera=bpy.context.object;camera.rotation_euler=(Vector((0,0,2))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.ortho_scale=6.2;scene.camera=camera
scene.render.filepath=str(root/'assets/scene/reviews/monitor-materials.png')
bpy.ops.render.render(write_still=True)
print('INSPECTION:',len([o for o in scene.objects if o.type=='MESH']),'meshes;',len(bpy.data.materials),'materials; native file reopened')
