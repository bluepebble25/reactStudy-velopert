import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { increase, decrease } from '../modules/counter';
import Counter from './Counter';

function CounterContainer() {
  const dispatch = useDispatch();
  const number = useSelector((state) => state.counter);

  const onIncrease = () => {
    dispatch(increase());
  };

  const onDecrease = () => {
    dispatch(decrease());
  };

  return (
    <Counter number={number} onIncrease={onIncrease} onDecrease={onDecrease} />
  );
}

export default CounterContainer;
