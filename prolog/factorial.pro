factorial(1, 1).
factorial(Number, Factorial) :-
    LowNumber is Number - 1,
    factorial(LowNumber, Result),
    Factorial = Result.
