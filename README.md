
# Guía de Búsqueda Estricta

A continuación se presentan las pautas a seguir para que su búsqueda sea reconocida correctamente. Por favor, siga cada uno de estos puntos con atención:

## Descripción
La búsqueda se estructura en uno o varios elementos de búsqueda, separados por espacios.
Cada elemento de búsqueda puede ser <u>una palabra</u> simple, <u>una frase</u>, <u>un campo</u> o 
una combinación de palabras y frases separados por operadores lógicos(*AND*, *OR*) y encerrados entre paréntesis.

### Definiciones
- **Palabra:** Secuencia de caracteres alfanuméricos sin espacios, comillas, cambios de línea, dos puntos(:) o paréntesis. 
Además, no puede comenzar con un guion(-).
- **Frase:** Secuencia de caracteres alfanuméricos, incluyendo espacios, comillas(dobles o simples), dos puntos(:) y paréntesis.
- **Campo:** Los campos válidos son: `appname`, `hostname`, `timestamp`, `data`, `data_exact`. Su uso se define como `campo:valor`.
En donde `valor` puede ser palabra, frase o una combinación de estas encerradas entre paréntesis y separadas por operadores lógicos.
De los campos el único analizado es `data`, el resto se considera como texto plano. Los campos en texto plano pueden usar comodines 
en los valores a los que hacen referencia.

1. **Búsqueda de palabras simples:**  
   - Puede usar una sola palabra sin comillas ni espacios internos.  
     Ejemplo: `error`.<br>
   - El sistema interpretará la ausencia de `campo:` como una búsqueda en `data_exact`. En el caso del ejemplo 
     el sistema buscará los logs en donde el campo `data_exact` tenga exactamente la palabra `error`. Podemos usar comodines 
     para obtener frases que contengan dicha palabra.<br>
     Ejemplo: `error*`.<br>
   - En este caso el sistema buscará los logs en donde el campo `data_exact` comience con la palabra `error` y 
     luego pueda tener cualquier cantidad de caracteres. Para logs que contenga la palabra `error` en cualquier posición
     se puede usar el comodín al inicio y al final de la palabra.
<br><br>
2. **Búsqueda de frases exactas:**  
   - Para buscar una secuencia exacta de palabras, encierre el texto entre comillas dobles **o** simples (pero no mezcle tipos).  
     Ejemplos: `"falla crítica"` o `'falla crítica'`  
   - No utilice comillas dentro de las frases ni mezcle comillas dobles y simples en la misma frase.
   - Los comodines funcionan en frases exactas.  
	 Ejemplo: `"falla crít*"`  
	 En este caso el sistema buscará los logs en donde el campo `data_exact` contenga la frase `falla crítica` seguida de cualquier cantidad de caracteres.
<br><br>
3. **Búsqueda por campo:**  
   - Use el nombre exacto de un campo seguido de `:` y luego la palabra o frase.  
   - Campos válidos: `appname`, `-appname`, `hostname`, `-hostname`, `timestamp`, `-timestamp`, `data`, `-data`, `data_exact`, `-data_exact`  
     Ejemplos: `appname:"miAplicación"`, `hostname:servidor01`, `-data:"contenido no deseado"`.<br>
     Ejemplo: `timestamp:"[2021-01-01T00:00:00Z TO 2021-12-31T23:59:59Z]"`. Para este campo asegurarse que las comillas dobles encierran el `valor`,
     además, el formato de fecha a usar es `YYYY-MM-DDTHH-mm-ssZ`.
<br><br>
4. **Uso estricto de conectores lógicos:**  
   - `AND` (o `and`): Ambas condiciones deben cumplirse.  
     Ejemplo: `error AND appname:"miAplicación"`  
   - `OR` (o `or`): Al menos una de las condiciones debe cumplirse.  
     Ejemplo: `"falla" OR "error"`  
   - `NOT` (o `-`): Excluir una palabra, frase o campo.  
     Ejemplos: `error NOT "falso positivo"`, `-hostname:"servidor02"`
<br><br>
5. **Agrupación de condiciones:**  
   - Use paréntesis para agrupar búsquedas complejas, asegurando que cada paréntesis de apertura tenga su cierre.  
     Ejemplo: `(error OR "falla") AND (appname:"miAplicación" OR hostname:servidor01)`
<br><br>
6. **Evitar caracteres inválidos:**  
   - No use espacios, comillas o paréntesis dentro de palabras simples.  
   - Para secuencias complejas, utilice frases entre comillas.  
   - Asegúrese de no introducir campos inexistentes ni conectores desconocidos.
<br><br>
7. **Búsqueda de palabras parciales:**
   - Puede buscar palabras parciales usando el carácter `*` al final de la palabra.  
        Ejemplo: `erro*` (buscará `error`, `errores`, `erroneo`, etc.)
<br><br>
8. **Búsqueda de palabras similares:**
	   - Puede buscar palabras similares usando el carácter `~` seguido de un número que indica la distancia de edición permitida.  
	 Ejemplo: `data:erro~1` (buscará `error`, `errores`, `erroneo`, etc.)
<br><br>
Cumpliendo estas normas, sus búsquedas serán reconocidas correctamente por el sistema.
