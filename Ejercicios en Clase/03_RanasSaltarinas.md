## Problema de las ranas, generar espacio de estados

### Reglas
- Estado inicial (lb,lb,lb,rr,rr,rr)
- No se pueden regresar a donde saltaron
- No se pueden saltar dos espacios, solo uno o sobre otra rana
- El espacio de soluciones que se desprenden de este juego (Solo realizar de un lado del juego ya que el otro lado sera un espejo)

#### Medidas de Rendimiento
- Estado de aceptacion alcanzado (lr,lr,lr,rb,rb,rb)
- Alcanzar el estado de aceptacion en el menor numero de pasos posibles

#### Secuencia de percepción
- <span style="color: blue">BlueF BlueF BlueF </span> ____ <span style="color: red">RedF RedF RedF </span> 
- BlueF BlueF BlueF RedF ____ RedF RedF 
- BlueF BlueF ____ RedF BlueF RedF RedF 
- BlueF BlueF RedF ____ BlueF RedF RedF 
- BlueF ____ RedF BlueF BlueF RedF RedF 
- BlueF RedF ____ BlueF BlueF RedF RedF 
- ____ RedF BlueF BlueF BlueF RedF RedF 
- RedF ____ BlueF BlueF BlueF RedF RedF

---
- <span style="color: blue">BlueF BlueF BlueF </span> ____ <span style="color: red">RedF RedF RedF </span> 
- BlueF BlueF BlueF RedF ____ RedF RedF 






#### Espacio de soluciones
- Que no sea tiro a tiro, tenemos que llegar al estado de aceptacion.
