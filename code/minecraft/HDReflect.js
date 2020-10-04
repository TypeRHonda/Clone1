/* MakeHDReflect() reads Mincraft Coder Pack files (MCP) to build mappings * between Notchian names (Java classes with obfuscated class, method, * and field names, released to the public by Mojang) and "human" names * (names chosen by reverse engineers.) *  * It returns an object that allows you to inspect its procedure and also * to begin writing "human" Javascript code! * * This function returns an object. Below is a description of each property * you can expect to find in that object. * * @returns       HDReflect()   Returns a constructor function, which in *                              can create "wrapped" instances with human *                              field accessors and method names. */function MakeHDReflect() {  /* There are three types of names you'll encounter when writing Minecraft   * mods with MCP. Here is how they interrelate:   *   *   Notchian (Official Minecraft releases) <->   *      <-> Decompiler (Searge) <->   *             <-> Human (reverse engineers)   *   * This means we have two phases and two different sources of information   * to draw on when mapping from obfuscated Notchian names to Human names.   *   * Notchian names are what we'll find in the global variable Packages, and   * perhaps also in net.minecraft.client.*.   *   * Decompiler names we will never see when using MCJS, but they are an   * intermediate step in the process of converting between Notchian and   * Human names. Decompiler names should not be needed outside of this   * function and you can promptly forget about them.   *   * Human names are written by the great reverse engineers of the Minecraft   * Coder Pack project! Visit them on EsperNET in #mcp!   */
  /* This variable defines whether we are server or client. */  var isServer = false;
  /* Index Human names by Searge names (methods) */  var humanMethodNamesBySeargeName = {};  flines(minecraftDir+'/methods.csv', function(line, lineNo) {    /* First line is column names */    if (lineNo == 1)      return;
    var [seargeName, humanName, existsInServer, description] = line.split(',')
    /* Check it this is for server or client, and determine if we care */    if (+existsInServer != isServer)      return;
    /* Record this entry; key is seargeName, value is humanName */    humanMethodNamesBySeargeName[seargeName] = {      humanMethodName:    humanName,      methodDescription:  description    };    print('humanMethodNamesBySeargeName['+seargeName+'] = '+humanName);  })
  /* Index Human names by Searge names (fields) */  var humanFieldNamesBySeargeName = {};  flines(minecraftDir+'/fields.csv', function(line, lineNo) {    /* First line is column names */    if (lineNo == 1)      return;
    var [seargeName, humanName, existsInServer, description] = line.split(',')
    /* Check it this is for server or client, and determine if we care */    if (+existsInServer != isServer)      return;
    /* Record this entry; key is seargeName, value is humanName */    humanFieldNamesBySeargeName[seargeName] = {      humanFieldName:    humanName,      fieldDescription:  description    };    return;  });
  /* Index Searge names by Notchian names (methods, and fields) and Human   * class names by Notchian names.   */  var humanClassNamesByNotchName = {};  var seargeMethodNamesByNotchName = {};  var seargeFieldNamesByNotchName  = {};  flines(minecraftDir+'/'+(isServer?'server':'client')+'.srg', function(line, lineNo) {    var elements = line.split(' ');    switch (elements[0].substr(0,2)) {      case 'PK':        break;      case 'CL':        var [type, notchName, humanName] = elements;        humanClassNamesByNotchName[slashdot(notchName)] = slashdot(humanName);        break;      case 'MD':        var [type, notchName, notchSignature, seargeName, seargeSignature] = elements;        seargeMethodNamesByNotchName[slashdot(notchName)+notchSignature] = {          notchName:        slashdot(notchName),          notchSignature:   notchSignature,          seargeName:       slashdot(seargeName),          seargeSignature:  seargeSignature        };        break;      case 'FD':        var [type, notchName, seargeName] = elements;        //print('slashdot("'+seargeName+'") =', slashdot(seargeName));        seargeFieldNamesByNotchName[slashdot(notchName)] = slashdot(seargeName);        //print('seargeFieldNamesByNotchName.'+slashdot(notchName)+' = "'+slashdot(seargeName)+'"');        break;      default:        throw new Error('Unknown Searge record type: "'+type+'"');    }  });
  for (var k in seargeFieldNamesByNotchName) {    //print('seargeFieldNamesByNotchName["'+k+'"] = "'+seargeFieldNamesByNotchName[k]+'"');  }
  for (var k in seargeMethodNamesByNotchName) {    print('seargeMethodNamesByNotchName["'+k+'"] =', JSON.stringify(seargeMethodNamesByNotchName[k]));  }
  /* Now we can finally map from end-to-end: Notchian names to Human names.   * Some classes, methods, and fields may have completely unobfuscated names.   * These can come from the original Notch jars (as in the case of   * net.minecraft.client.Minecraft) or they can come from a Java-language   * mod. We will treat them equally for simplicity.   */  var HDReflections = {};  Object.keys(humanClassNamesByNotchName).forEach(function (notchClassName) {    var humanClassName = humanClassNamesByNotchName[notchClassName];
    /* notchClass is the Java class */    //print('wrapping class', notchClassName, '\t->', humanClassName);    var notchClass = java.lang.Class.forName(notchClassName);    var rhinoClass = Packages[notchClassName];
    /* humanConstructor is our wrapper */    var humanConstructor = function(notchInstance) {      /* If this is called as a constructor, we will attempt to instantiate a       * a new Obfuscated object and wrap that.       */      if (this instanceof arguments.callee) {        this.notchInstance = VarCons(rhinoClass, arguments);      } else {        var rval = Object.create(arguments.callee.prototype);        rval.notchInstance = notchInstance;        return rval;      }    };
    HDReflections[humanClassName] = humanConstructor;
    var simpleHumanClassName = humanClassName.split('.').pop(); // TODO    humanConstructor.prototype.toString = function() {      return '['+humanClassName+' '+this.notchInstance+']';    }
    /* fields */    var notchFields = notchClass.fields;    notchFields.forEach(function(notchField) {      var notchFieldDecl = String(notchField);      /* notchFieldDecl is going to look something like "public static       * final <notchClassName> <notchClassName>.<notchFieldDecl> but       * all we want is the last part.       */      //print('wrapping field: notchFieldDecl =', notchFieldDecl);      var notchFieldName = notchFieldDecl.split(' ').pop();      //print('wrapping field: notchFieldName =', notchFieldName);      var seargeFieldName = seargeFieldNamesByNotchName[notchFieldName];      if ('undefined' != typeof seargeFieldName) {        //print('wrapping field: seargeFieldName =', seargeFieldName);        var simpleNotchFieldName = notchFieldName.split('.').pop();        var simpleSeargeFieldName = seargeFieldName.split('.').pop();        //print('wtf', typeof seargeFieldName, 'wtf', seargeFieldName, 'wtf', seargeFieldName.split('.').length, 'wtf', seargeFieldName.split('.').pop());        //print('retrieving key "'+simpleSeargeFieldName+'" from humanFieldNamesBySeargeName');        if ('undefined' != typeof humanFieldNamesBySeargeName[simpleSeargeFieldName]) {          var {humanFieldName:humanFieldName, fieldDescription:fieldDescription} = humanFieldNamesBySeargeName[simpleSeargeFieldName];          // TODO var simpleHumanFieldName = humanFieldName.split('.').pop();          //print('    wrapping field', notchFieldName, '\t->', simpleSeargeFieldName, '\t->', humanFieldName);          humanConstructor.prototype.__defineGetter__(humanFieldName, function() {            print('  gettering', humanFieldName, 'aka', simpleNotchFieldName);            print('           ', typeof this.notchInstance[simpleNotchFieldName]);            return this.notchInstance[simpleNotchFieldName];          });        } else {          /* This field has not been reverse-engineered! */          //print('Skipping "'+seargeFieldName+'" (not in fields.csv)');        }      } else {        /* This symbol was not found in the appropriate .srg file, meaning,         * short of decompiler malfunction, that this symbol was never         * obfuscated to begin with. Most likely it was inherited from a         * standard Java class for interface, or it was added by a modder.         */        //print('Skipping non-obfuscated field "'+notchFieldDecl+'" (not in .srg file)');      }    });
    /* methods */    var notchMethods = notchClass.methods;    notchMethods.forEach(function(method) {      print('method', uneval(String(method)));      var seargeMethodSignature = seargeMethSigFromJava(String(method));      print('      ->', seargeMethodSignature);      var seargeMethodDesc = seargeMethodNamesByNotchName[seargeMethodSignature];      if (seargeMethodDesc) {        print('        ->', seargeMethodDesc.seargeName);        var simpleSeargeMethodName = seargeMethodDesc.seargeName.split('.').pop();        var humanMethod = humanMethodNamesBySeargeName[simpleSeargeMethodName];        if (humanMethod) {          print('          -> ', humanMethod.humanMethodName, humanMethod.methodDescription);
          /* Full method wrapper with reverse engineered name! */          humanConstructor.prototype[humanMethod.humanMethodName] = function() {            var args = Array.prototype.map.call(arguments, function(arg) {              return ('undefined' == typeof arg.notchInstance) ? arg : arg.notchInstance;            });            /* @TODO can i just??? return method.apply(this.notchInstance,arguments) */            return this.notchInstance[method.name].apply(this.notchInstance, args);          }        }      }    })
    function HDWrap(notchInstance) {          }  });
  return HDReflections;}
/* Boot! */var hdreflection = MakeHDReflect();
