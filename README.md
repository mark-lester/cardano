# Cardano
Cardano grid investigation tool
## Usage
```
node cardano.js [options] [dictionary file]
``````
### Options
```
-m [file] - specific rabuses to mirror file, default mirror.def
-r [file] - specific rabuses file, default rabuses.def
-s [file] - specific special words file, default spevcial.list
-c [file] - specific cardano grid input. default is cardano.object
-p [grid width] - print grid of given width
-v - verbose output, includes coordinate strings of all matches
-d [debug level] - produce debug output yo given debug level
-R - turn reverse searching off, default is to search backwards and forwards
``````
## Verbage
cardano.js will search for any occurrence of any word from an input list, which can be the entire English dictionary if you want, 
and a definition file of all instances of all the rabus shapes you have defined and suspect, separated by blank lines.
The rabus file might look like
```
1
2
3

 1
234
 5
``````
and another file that you fill with rabuses you want to also repeat mirrored vertically so you don't have to do those twice e.g.
```
 1
 2
345
``````
And any non vertically symmetrical crucifixes we want.
So we can define all the diagonals if we want
```
1
 2
  3```

1
 2
  3
   4
...
```
And put them in the mirrors file and we get both directions. It tests all of these backwards and forwards, but you have to force it to look for anagrams.  It will hunt through all instances of all of these shapes in all the possible grids of an input cardano for any of your input words. You can even provide it with a special list of words you wish to anagrammise, but you cant take the proverbial with that, factorial(word length) gets carried away, as I'm sure you know.
And it will do it in all but an instant (we all stand on the shoulders of greatness). You can play about with these files, just give it a rabus of
```
1
2
3
``````
and a word list consisting only of
```
TTT
``````
and I will tell you in a blink which grids have got our surgical scar on. For the CVRST BE head stone on what is alleged to be Shakespeare's grave, 
there are actually 3 grids that have that mark
```
cardano -c grave.object -r ttt.def -s ttt.list -m null.list -p 6 ttt.list -v null.list
BEST GRIDS 6,12,17
SCORE 16
6 16 1 [ 'TTT@6:5:6:6:6:7:' ]
12 16 1 [ 'TTT@11:6:11:7:11:8:' ]
17 16 1 [ 'TTT@10:4:10:5:10:6:' ]
``````
And if we extend that to
```
1
2
3

 1
 2
345
``````
and a word list of
```
TTT
VERES
``````
We get
```
./cardano.js -c grave.object -r grave.def -s grave.list -m null.list -p 6 devere.list -v null.list
BEST GRIDS 6,17
SCORE 272
6 272 2 [ 'TTT@6:5,6:6,6:7,', 'VESER@2:18,3:16,3:17,3:18,4:18,' ]
17 272 2 [ 'TTT@10:4,10:5,10:6,', 'VRSEE@7:6,8:4,8:5,8:6,9:6,' ]
25 256 1 [ 'VESER@4:5,5:3,5:4,5:5,6:5,' ]
12 16 1 [ 'TTT@11:6,11:7,11:8,' ]
....
GOODFR
ENDFOR
IESVSS
AKEFOR
BEARET
ODIGGT
HEDVST
ENCLOA
SEDHEA
REBLES
TEBEYE
MANYTS
PAREST
HESSTO
NESAND
CVRSTB
EHEYTM
OVESMY
BONES
``````
In the example I included -p 6 on the command line so you can see that grud. So as you see grid 6 has our inverted Veres T also, as well as our surgical scar of TTT, though the inverted T is at the bottom of our cramped vertical grid, starting at coordinate 2,18 (the origin is top left, X across and Y down)
For the Sonnets dedication we can find out that actually 5 grids have got the TTT. With so many Ts that's unsurprising IMO.
```
cardano -c sonnets.object -r ttt.def -s ttt.list -m null.list -p 19 ttt.list -v null.list
BEST GRIDS 36,10,19,5,22
SCORE 16
36 16 1 [ 'TTT@27:2,27:3,27:4,' ]
10 16 1 [ 'TTT@6:13,6:14,6:15,' ]
19 16 1 [ 'TTT@12:6,12:7,12:8,' ]
5 16 1 [ 'TTT@5:12,5:13,5:14,' ]
22 16 1 [ 'TTT@16:1,16:2,16:3,' ]
...
``````

