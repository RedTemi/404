import React from "react";
import ChipKey from "./ChipKey";
import "./ChipKeys.css";

interface ChipKeysProps {
    chipBet: (amount: number) => void;
    }
export default function ChipKeys({ chipBet }: ChipKeysProps) {
  function onChildClick(amount: number) {
    console.log(amount);
    chipBet(amount);
  }
  return (
    <div className="chipKeys">
      <ChipKey amount={1} clickHandler={() => onChildClick(1)} />
      <ChipKey amount={5} clickHandler={() => onChildClick(5)} />
      <ChipKey amount={10} clickHandler={() => onChildClick(10)} />
      <ChipKey amount={25} clickHandler={() => onChildClick(25)} />
      <ChipKey amount={50} clickHandler={() => onChildClick(50)}/>
      <ChipKey amount={100} clickHandler={() => onChildClick(100)}/>
      <ChipKey amount={200} clickHandler={() => onChildClick(200)}/>
      <ChipKey amount={300} clickHandler={() => onChildClick(300)}/>
      <ChipKey amount={400} clickHandler={() => onChildClick(400)}/>
      <ChipKey amount={500} clickHandler={() => onChildClick(500)}/>
      <ChipKey amount={1000} clickHandler={() => onChildClick(1000)}/>
    </div>
  );
}
