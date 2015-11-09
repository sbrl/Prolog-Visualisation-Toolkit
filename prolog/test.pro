/* Let's us define a tree */
root(a).
tree(a,b).
tree(a,c).
tree(b,d).
tree(b,e).
tree(b,f).
tree(d,i).
tree(d,j).
tree(f,k).
tree(c,g).
tree(c,h).
tree(g,l).
tree(h,m).

fact(m).

dfs:-
    root(a),
    dfs(a).
dfs(A):- fact(A).   /* the stopping condition */
dfs(A):- tree(A,B), dfs(B).

/* Chatty version */
chatty_dfs:-
	write('Welcome to Chatty Depth First Search. '),nl,
    write('Going to start with root(a)'),nl,
    root(a),
    chatty_dfs(a).
chatty_dfs(A):-
	write('Going to see if '),write(A), write(' is a fact.'),nl,
	fact(A),
	write('Yes it is so we can succeed. End of trace'),nl.   /* the stopping condition */
chatty_dfs(A):-
	write('Ok it is not a fact, now let us see if it is part of the tree '),
	nl,
	tree(A,B),
	write('we have now found '),write(tree(A,B)),nl,
	write('So we will now try '),write(B),nl,chatty_dfs(B).
chatty_dfs(A):-
	write(A),write(' Has now failed so we are going to have to backtrack'),nl,
	fail.  /* we haven't done this yet - its next week.  It fails!  */

bfs:-
	write('Welcome to Chatty Breadth First Search. '),nl,
	write('Going to start with root(a)'),nl,
	root(Root),
	bfs([Root],1,4,[Root]).
	% Call with current dept 0, depth cut off 100
bfs(_,N,N,_):- write('stopping depth cut of reached!'),nl.
bfs([A|_],_,_,_):-
	write('Going to see if '),write(A), write(' is a fact.'),nl,
	fact(A),
	write('Yes it is so we can succeed. End of trace'),nl.
bfs([_|T],N,L,List):-
	write('Not it is no - going to try the next tree node'),nl,
	bfs(T,N,L,List).
bfs([],N,L,List):- write('There are no more nodes at this level in the tree so we are going to go one deeper'),nl,
	findall(Node,(member(Item,List),tree(Item,Node)),NewList),
	N1 is N + 1,  % go one level deeper in the tree
	nl,write('*Going to Level '),write(N1),nl,
	bfs(NewList,N1,L,NewList).
