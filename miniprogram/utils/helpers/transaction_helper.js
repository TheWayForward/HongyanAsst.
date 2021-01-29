function generate_serial_number_for_rental(){
  return `0${Math.floor(9999 * Math.random())}${Date.now()}`
}

function generate_serial_number_for_sale(){
  return `1${Math.floor(9999 * Math.random())}${Date.now()}`
}

module.exports = {
  generate_serial_number_for_rental: generate_serial_number_for_rental,
  generate_serial_number_for_sale: generate_serial_number_for_sale
}