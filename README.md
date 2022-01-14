# Cardano
Cardano grid investigation tool
## Usage
```
node cardano.js [options] [dictionary file]
``````
### Options
```
-c [file] - specific cardano grid input. default is cardano.object
-r [file] - specific rabuses file, default rabuses.def
-m [file] - specific rabuses to mirror file, default mirror.def
-s [file] - specific special words file, default spevcial.list

-p [grid width] - print grid of given width
-v - verbose output, includes coordinate strings of all matches
-d [debug level] - produce debug output to given debug level
-R - turn reverse searching off, default is to search backwards and forwards
``````
## Verbage
cardano.js will search for any occurrence of any word from an input list, 
and a definition file of all instances of all the rabus shapes you have defined and suspect. The input vocabulary list can be as large as you like, the entire english language can be handled if you so wish. The rabuses are defined simply by drawing the shapes as a series of ordered numbers in a defintion file separated by blank lines. A rabus file might look like
```
1
2
3

 1
234
 5
``````
If you need more than 9 characters just roll onto the alphabet, upper or lower case. so 'A' or 'a' means 10th. There is a secondary rabuse file, by default called mirrors.def, containing all the rabuses you want to also repeat mirrored vertically, so you don't have to do those twice e.g.
```
 1
 2
345
``````
And any non vertically symmetrical crucifixes we may want. There is a default rabuses file included in the distrubution which has all basic vertically symetrical rabuses such as straight lines but also captial Is that we suspect, including a mirror rabuses file containing all the simple diagonals, and all the 3 and 5 wide crucifixes including Ts defined. These all get duplicated upside down.
The diagonals just look like this
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
Cardano tests all of these backwards and forwards, but you have to force it to look for anagrams. It hunts through all instances of all of these shapes in all the possible grids of an input cardano for any of your input words. You can even provide it with a special list of words you wish to anagrammise, but you cant take the proverbial with that, factorial(word length) gets carried away.
For a data set consisting of the entire works of VVilliam Shakes-peare and King James Bible as input vocabulary, the program runs all but instantaneously.(we all stand on the shoulders of greatness). While actually detecting a cardano grid width is never trivial and my program isnt going to give you this on a plate mycg though I am trying, it is a very useful tool for verifying and testing assertions and finding specific words. 
You can play about with these files, 
## Examples
If we give it a rabus fle of 
```
1
2
3
``````
and a word list consisting only of
```
TTT
``````
and it will tell you, in a blink, which grids have got our surgical scar on. For the CVRST BE head stone on what is alleged to be Shake-speare's grave, 
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

## Limitations
Setting plain/natural/real text in a grid neccessarily produces an excellent distribution os Sctrabble letters from which to create words. This is part of the Cardano defence. The reader really needs to know what they are looking for, and this has certainly been the case on the three that I have examined in the VVilliam Shake-speare Authorship debate. Indeed most of the discovered crypts or messages are not even in English or are anagrammed. Cardano.js is not really capable of solving any of this. The scoring system will be develope as my current play thing, it's a lot of fun if you get a kick out of leathering the regular expression matching matching system. We might hit something for free but I suspect all it wil ultimately ever be able to do is hunt for things you can specify fairly acurately. 

It is nevertheless a useful tool in discovering simple things with little effort that might cost a valuable reasercher many hours effort. If you are working on these problems and have brutal word search requirements, please do ask for assistance. An hour or two of my time to save you a day and give you a tool you can reuse at will is a massive win.

