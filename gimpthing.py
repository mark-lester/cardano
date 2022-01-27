def load(image,file):
  new_vectors=pdb.gimp_vectors_new(image, 'Vectors!')
  pdb.python_fu_path_csv_import(image,new_vectors,file)
  return pdb.gimp_image_add_vectors(image, new_vectors, 0)


def circle(image,points):
  path = pointlist2path(image, points)
  return pdb.python_fu_ofn_circumcircle(image,path)                                                       

# Convert a pointlist=[[x,y],[x,y],...] to a path and insert in Gimp
def pointlist2path(image, pointlist, closed=False):
   path = pdb.gimp_vectors_new(image, 'path from pointlist')
   points = []
   for x,y in pointlist:
       points += [x,y,x,y,x,y]
   pdb.gimp_vectors_stroke_new_from_points(path, 0, len(points), points, closed)
   pdb.gimp_image_insert_vectors(image, path, None, 0)
   path.visible = True
   return path

##################
points=[[906,3905],[2326,2343],[2166.96,4024.2799999999997]]
file= "/home/mark/cardano/original.csv"
images = gimp.image_list()
image = images[0]
load(image,file)
circle(image,points)
