import React from 'react'

const Hola = (params:any) => {

console.log('params', params)

  return (
    <div>{params?.saludo}</div>
  )
}

export default Hola