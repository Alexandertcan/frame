import bpy, math, os, json
from pathlib import Path
from mathutils import Vector
root=str(Path(__file__).resolve().parents[1]/'public'/'studio')
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
# Original architectural/product models; metre-scale, physically plausible PBR.
def mat(name,col,metal=0,rough=.5):
 m=bpy.data.materials.new(name);m.diffuse_color=(*col,1);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*col,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough;return m
paper=mat('warm cotton paper',(.78,.755,.68),rough=.76);white=mat('porcelain enamel',(.86,.84,.78),rough=.32);concrete=mat('fine limestone',(.64,.63,.59),rough=.85);dark=mat('graphite powder coat',(.043,.048,.047),rough=.4);silver=mat('brushed aluminium',(.63,.66,.66),metal=1,rough=.32);chrome=mat('polished stainless',(.68,.72,.72),metal=1,rough=.16);yellow=mat('signal yellow',(.95,.7,.01),rough=.46);blue=mat('ink blue',(.12,.22,.31),rough=.5);black=mat('screen bezel',(.009,.012,.013),rough=.26);screen=mat('screen white',(.84,.83,.77),rough=.4)
# export hierarchy names identify interactive targets
parents={}
for key in ['create','inspiration','projects','tool']:
 p=bpy.data.objects.new(key,None);bpy.context.collection.objects.link(p);parents[key]=p

def cube(name,loc,dim,material,bevel=.04,parent=None):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=dim;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(material)
 if bevel:mod=o.modifiers.new('machined radiused edge','BEVEL');mod.width=bevel;mod.segments=3;o.modifiers.new('weighted normals','WEIGHTED_NORMAL')
 if parent:o.parent=parents[parent]
 return o

def cyl(name,loc,r,depth,material,parent=None,rot=None,vertices=48):
 bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=r,depth=depth,location=loc);o=bpy.context.object;o.name=name;o.data.materials.append(material)
 if rot:o.rotation_euler=rot
 mod=o.modifiers.new('rounded rim','BEVEL');mod.width=.012;mod.segments=3;o.modifiers.new('weighted normals','WEIGHTED_NORMAL')
 for p in o.data.polygons:p.use_smooth=True
 if parent:o.parent=parents[parent]
 return o

def rod(name,a,b,r,m,parent=None):
 mid=(Vector(a)+Vector(b))/2;diff=Vector(b)-Vector(a);o=cyl(name,mid,r,diff.length,m,parent);o.rotation_euler=diff.to_track_quat('Z','Y').to_euler();return o

def text(body,loc,size,m,rot=(math.pi/2,0,0),parent=None):
 curve=bpy.data.curves.new('engraved typography','FONT');curve.body=body;curve.size=size;curve.extrude=.001;curve.space_character=1.1;o=bpy.data.objects.new(body,curve);bpy.context.collection.objects.link(o);o.location=loc;o.rotation_euler=rot;o.data.materials.append(m)
 if parent:o.parent=parents[parent]
 return o

# gallery slab and raised plinth joints
cube('stone studio base',(0,0,-.12),(8.6,6.3,.24),paper,.1)
for x in [-2.8,-1.4,0,1.4,2.8]:cube('fine floor expansion seam',(x,0,.004),(.007,6,.002),concrete,0)
# right rear white wall with large architectural arch built from ring sectors
cube('left pier',(-3.52,2.73,1.85),(1.3,.26,3.7),white,.04)
cube('right pier',(3.24,2.73,1.85),(1.82,.26,3.7),white,.04)
# arch profile opens towards viewer, raytraced thickness
cx=-.55; radius=2.17;inner=1.78; spring=1.45
verts=[];faces=[]
for y in [2.6,2.88]:
 for r in [inner,radius]:
  for j in range(49):a=j*math.pi/48;verts.append((cx+r*math.cos(a),y,spring+r*math.sin(a)))
for j in range(48):
 for row in [0,98]:faces.append((row+j,row+j+1,row+49+j+1,row+49+j))
 faces.append((j,j+1,98+j+1,98+j));faces.append((49+j,147+j,147+j+1,49+j+1))
faces +=[(0,98,147,49),(48,97,195,146)]
mesh=bpy.data.meshes.new('arch vaulted profile');mesh.from_pydata(verts,[],faces);mesh.update();o=bpy.data.objects.new('vaulted studio lintel',mesh);bpy.context.collection.objects.link(o);o.data.materials.append(white);mod=o.modifiers.new('soft stone edges','BEVEL');mod.width=.035;mod.segments=3;o.modifiers.new('normals','WEIGHTED_NORMAL')
cube('arch foot left',(cx-inner-.195,2.74,.72),(.39,.28,1.45),white)
cube('arch foot right',(cx+inner+.195,2.74,.72),(.39,.28,1.45),white)
# restrained perforated aluminium shade behind gallery
for x in [i*.13-2.2 for i in range(28)]:cube('rear vertical aluminium slat',(x,2.98,1.45),(.025,.09,2.85),silver,.009)
# desk sculpted folded supports and powder coated suspended surface
cube('writing desk worktop',(.45,-.62,1.31),(3.95,1.66,.12),white,.07,'create')
for x in [-1.13,2.01]:
 cube('folded aluminium desk leg',(x,-.55,.64),(.12,1.28,1.2),silver,.035,'create')
 cube('stabilising foot',(x,-.53,.07),(.57,1.54,.085),silver,.035,'create')
 cube('shadow line on leg',(x+.063,-.54,.65),(.005,.95,.93),dark,.003,'create')
# ultrawide monitor with layered enclosure, stand and actual website content geometry
cube('monitor pedestal',(.29,-.32,1.395),(.66,.42,.04),silver,.03,'create')
cube('monitor stem',(.29,-.17,1.68),(.085,.10,.55),silver,.014,'create')
cube('bevelled monitor back',(.29,-.14,2.02),(1.94,.095,1.13),silver,.045,'create')
cube('graphite monitor bezel',(.29,-.195,2.02),(1.9,.027,1.10),black,.035,'create')
cube('screen canvas',(.29,-.216,2.04),(1.78,.008,.95),screen,.018,'create')
# screen diagram is original product canvas
text('MORROW',(-.51,-.225,2.39),.092,dark,parent='create')
text('ABOUT   OBJECTS   JOURNAL',(.02,-.226,2.415),.025,dark,parent='create')
text('Everyday,',(-.51,-.227,2.20),.125,dark,parent='create');text('considered.',(-.51,-.227,2.035),.125,dark,parent='create')
text('Objects for a quieter kind of living.',(-.51,-.227,1.907),.027,dark,parent='create')
cube('screen call to action',(-.29,-.23,1.785),(.43,.006,.065),yellow,.006,'create')
text('EXPLORE OBJECTS',(-.48,-.237,1.773),.023,dark,parent='create')
cube('screen editorial picture',(.77,-.233,2.02),(.59,.009,.55),blue,.006,'create')
# stylised vessel on screen, not borrowed photo
cyl('screen design sculpture',(.77,-.245,2.04),.18,.035,paper,'create',(math.pi/2,0,0))
text('01   A NEW PERSPECTIVE',(-.51,-.227,1.633),.027,dark,parent='create')
# keyboard individual keys with low poly bevel
cube('keyboard aluminium chassis',(.28,-1.06,1.42),(1.27,.43,.048),silver,.026,'create')
for row in range(4):
 for col in range(14):cube('keycap',(-.28+col*.085,-1.20+row*.09,1.454),(.074,.075,.021),white,.006,'create')
cube('spacebar',(.23,-1.21,1.469),(.37,.058,.008),paper,.005,'create')
cube('trackpad',(1.2,-1.05,1.42),(.35,.4,.03),silver,.04,'create')
# lamp articulated with ceramic shade
cyl('lamp base',(-1.10,-.65,1.407),.2,.05,silver,'create')
rod('lamp lower arm',(-1.10,-.65,1.42),(-1.12,-.56,2.17),.026,silver,'create');rod('lamp upper arm',(-1.12,-.56,2.17),(-.79,-.50,2.53),.026,silver,'create')
cyl('lamp hinge',(-1.12,-.56,2.17),.05,.055,dark,'create',(math.pi/2,0,0))
bpy.ops.mesh.primitive_cone_add(vertices=48,radius1=.24,radius2=.11,depth=.24,location=(-.77,-.5,2.43));o=bpy.context.object;o.name='ceramic task lamp';o.data.materials.append(white);o.parent=parents['create'];mod=o.modifiers.new('shade rim','BEVEL');mod.width=.013;mod.segments=3
# ceramic cup and handles, pen and sketch paper with curled lifted corners
cyl('ceramic cup',(-.93,-1.16,1.5),.085,.21,white,'create');cyl('coffee surface',(-.93,-1.16,1.605),.07,.002,dark,'create')
bpy.ops.mesh.primitive_torus_add(major_radius=.06,minor_radius=.014,major_segments=24,minor_segments=8,location=(-.84,-1.16,1.52),rotation=(math.pi/2,0,0));o=bpy.context.object;o.name='cup handle';o.data.materials.append(white);o.parent=parents['create']
for i in range(4):
 p=cube('paper sketch sheet',(1.68,-.87,1.402+i*.007),(.47,.54,.006),paper,.004,'create');p.rotation_euler.z=.1-i*.03
rod('mechanical pencil',(1.57,-1.14,1.45),(1.81,-.74,1.45),.009,dark,'create')
# sample rack: vertical rails, three shelves, printed paper covers & binding details
for x in [-3.0,-1.72]:rod('sample rack upright',(x,1.35,.04),(x,1.35,2.50),.025,silver,'inspiration')
for z in [.44,1.11,1.78]:
 cube('sample rail',(-2.36,1.36,z),(1.40,.20,.04),silver,.015,'inspiration')
 for j,m in enumerate([blue,paper,yellow]):
  x=-2.83+j*.46
  cover=cube('bound design sample',(x,1.24,z+.27),(.38,.035,.51),m,.012,'inspiration');cover.rotation_euler.x=-.12
  cube('cover paper edge',(x,1.255,z+.27),(.36,.025,.48),white,.008,'inspiration')
  text(['FORM','TYPE','GRID'][j],(x-.145,1.216,z+.31),.065,white if j==0 else dark,parent='inspiration')
  text('DESIGN NOTES',(x-.145,1.205,z+.095),.021,white if j==0 else dark,parent='inspiration')
text('REFERENCE LIBRARY',(-3.03,1.17,2.55),.075,dark,parent='inspiration')
# archive left foreground: drawers, seams, pulls, labels; tactile toolboxes
cube('archive cabinet',(-2.72,-1.15,.52),(1.10,.91,1.04),silver,.065,'projects')
for i in range(3):
 z=.2+i*.30;cube('archive drawer',(-2.72,-1.615,z),(1.02,.035,.275),white,.022,'projects');rod('drawer pull',(-2.93,-1.676,z),(-2.56,-1.676,z),.018,silver,'projects');cube('drawer label plate',(-3.02,-1.641,z+.078),(.16,.003,.049),paper,.005,'projects')
for i in range(3):
 cube('archive folder',(-2.72,-1.17,1.075+i*.039),(.91,.65,.031),paper,.012,'projects')
cube('yellow project binder',(-2.72,-1.17,1.20),(.94,.66,.065),yellow,.01,'projects')
text('PROJECT ARCHIVE',(-3.19,-1.519,1.246),.06,dark,(0,0,0),'projects')
# distinctive physical device: precision rotating colour wheel on steel arc, coloured chips
cyl('material instrument base',(2.95,.85,.11),.57,.17,concrete,'tool')
rod('material instrument mast',(2.95,.85,.20),(2.95,.85,1.7),.04,chrome,'tool')
# ring industrial bent tube, open central void
bpy.ops.mesh.primitive_torus_add(major_radius=.68,minor_radius=.036,major_segments=72,minor_segments=12,location=(2.95,.85,2.05),rotation=(math.pi/2,0,0));o=bpy.context.object;o.name='material carousel stainless ring';o.data.materials.append(chrome);o.parent=parents['tool']
for j,m in enumerate([yellow,paper,blue,dark,silver,white]):
 a=j*math.pi/3;x=2.95+math.sin(a)*.49;z=2.05+math.cos(a)*.49
 chip=cube('material carousel sample',(x,.83,z),(.28,.07,.33),m,.035,'tool');chip.rotation_euler.y=a
cyl('precision centre hub',(2.95,.81,2.05),.1,.14,silver,'tool',(math.pi/2,0,0));rod('carousel axle',(2.95,.85,2.05),(2.95,.65,2.05),.028,dark,'tool')
# Frosted glass signage has real thickness, softened edges and mechanical fixings.
glass=mat('etched frosted glass',(.68,.75,.74),rough=.4)
glass.node_tree.nodes['Principled BSDF'].inputs['Transmission Weight'].default_value=.42
cube('frosted glass studio plaque',(2.73,2.545,3.06),(1.86,.035,.66),glass,.045)
for x in [1.87,3.59]:
 for z in [2.82,3.30]:cyl('signage standoff',(x,2.52,z),.018,.075,chrome,rot=(math.pi/2,0,0))
# wall horizontal studio lettering and architectural framing
text('FRAME', (1.90,2.51,3.05),.31,dark)
text('DESIGN STUDIO',(1.92,2.51,2.84),.058,dark)
# original pedestal display sculptural ribbon using thick continuous sweep
curve=bpy.data.curves.new('bent steel ribbon','CURVE');curve.dimensions='3D';curve.bevel_depth=.07;curve.bevel_resolution=4;sp=curve.splines.new('BEZIER');sp.bezier_points.add(4)
for b,co in zip(sp.bezier_points,[(.5,1.9,.4),(.7,1.9,1.3),(0,1.9,1.7),(-.5,1.9,1.3),(-.15,1.9,.65)]):b.co=co;b.handle_left_type='AUTO';b.handle_right_type='AUTO'
o=bpy.data.objects.new('bent stainless concept study',curve);bpy.context.collection.objects.link(o);o.data.materials.append(chrome)
cube('sculpture stone plinth',(.13,1.89,.17),(.9,.62,.34),concrete,.035)
# lighting and render
scene=bpy.context.scene;scene.world.color=(.75,.74,.71)
scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.79,.80,.80,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.5
for name,loc,power,size,col in [('large softbox',(-3,-4,8),1800,7,(1,.92,.8)),('window light',(4,1,6),1400,5,(.87,.93,1)),('front fill',(0,-6,4),650,5,(1,1,1))]:
 data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='DISK';data.size=size;data.color=col;o=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector((0,0,1))-o.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(9,-13,9));cam=bpy.context.object;cam.name='studio editorial camera';cam.rotation_euler=(Vector((0,.1,1.35))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=10.15;scene.camera=cam
scene.render.engine='CYCLES';scene.cycles.samples=40;scene.cycles.use_denoising=True
scene.render.resolution_x=1600;scene.render.resolution_y=1400;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.film_transparent=True;scene.render.filepath=root+'/studio.png'
scene.view_settings.view_transform='AgX'
bpy.ops.wm.save_as_mainfile(filepath=str(Path(root).parents[1]/'studio.blend'))
bpy.ops.render.render(write_still=True)
# curves converted by exporter; lights & camera withheld for controlled web runtime
bpy.ops.export_scene.gltf(filepath=root+'/studio.glb',export_format='GLB',export_apply=True,export_lights=False,export_cameras=False,export_animations=False)
print(json.dumps({'objects':len(bpy.data.objects),'original':True,'glb_bytes':os.path.getsize(root+'/studio.glb')}))
