jQuery(document).ready(function(){

   
    CambiaPestanas('.etWContainer .etWtabs a','active','.etWContainer .etWforms .form');

   
    //Configuraciones generales para los calendarios
    if ( $("#formahotel").length === 1 ) DefVar("#formahotel"); else DefVar("#formapackage");
    // Se crea evento para ejecutar funciones despues que muestra el calendario
    $.datepicker._updateDatepicker_original = $.datepicker._updateDatepicker;
    $.datepicker._updateDatepicker = function(inst) {
        $.datepicker._updateDatepicker_original(inst);
        var afterShow = this._get(inst, 'afterShow');
        if (afterShow)
            afterShow.apply((inst.input ? inst.input[0] : null));  // trigger custom callback
    }

    jQuery(".EtDateFromGN" ).datepicker({
        dateFormat: FormatO,
        showOn: "both",
        buttonImageOnly: true,
        buttonText: "",
        numberOfMonths: 2,
        showButtonPanel: true,
        minDate:0,
        maxDate:"+1y",
        beforeShowDay: RangoDias,
        onClose: function(dates){ jQuery(this).parents('form').find(".EtDateToGN").show("slow").datepicker("show");},
        onSelect: OnSelectDate
        
	});
    jQuery(".EtDateToGN").datepicker({
        dateFormat: FormatO,
        showOn: "both",
        buttonImageOnly: true,
        buttonText: "",
        numberOfMonths: 2,
        showButtonPanel: true,
        minDate:+1,
        maxDate:"+1y +1d",
        beforeShowDay: RangoDias,
        afterShow: NumeroNoches,
        onSelect: OnSelectDate
    });
    DefaultDate();

    jQuery("body").on("mouseenter","#ui-datepicker-div td a", NumeroNochesHover);
    jQuery("body").on("mouseleave","#ui-datepicker-div td a", function(){  jQuery(".Noches").text(noches+" Noches"); });
    /*Termina Calendarios*/
    ResetAll();
    //Modificar el foco
    changeFocus("#EtDestinyHtl",MsjDestinO);
    changeFocus("#EtHotel",FalseHotel);
    changeFocus("#EtCityOrig,#EtDestinyPkl,#EtCityOrigFL,#EtDestinyFL",MsjAirport);
    changeFocus("#formacar input[name=nu],#formacar input[name=no]", MsjDestinO);

    // Pasa el valor del select al span
    jQuery(".etWContainer").find(".etWSelect select").change(function() {
        jQuery(this).next("span").text(jQuery(this).find("option:selected").text());
    }).change();// para que lo ejecute cuando se cargue la pagina


    // Config de form hoteles
    if ($("#formahotel").length === 1) {
        jQuery('#formahotel').submit(function(){ return(ValidateHotel('formahotel','EtDestinyHtl',MsjDestinO,AltMsjDestinO)); })        
        jQuery('#formahotel').submit(function(){ return(restrict45Days('formahotel')); });  
        jQuery("#formahotel .rm select").change(function(){changeRoom('#formahotel','')});
        jQuery("#Room1 select[name=ch1]").change(function(){setAgeC(1,'')});
        jQuery("#Age1 select").change(function(){setAgeCI('',1)});
        jQuery("#Room2 select[name=ch2]").change(function(){setAgeC(2,'')});
        jQuery("#Age2 select").change(function(){setAgeCI('',2)});      
        jQuery("#Room3 select[name=ch3]").change(function(){setAgeC(3,'')});
        jQuery("#Age3 select").change(function(){setAgeCI('',3)});
        //autocompletado Hotel
        jQuery("#EtDestinyHtl").catcomplete({
            minLength: 3,
            delay: 0,
            source: function(request, response) {
                if (request.term in cacheDH) {
                    response(cacheDH[request.term]);
                    return;
                }
                jQuery.ajax({
                    url: "http://www.bestday.com.mx/searchservices/getSearchJson.aspx?Lenguaje="+IDioMA+"&ItemTypes=D:5,H:5&PalabraBuscada="+jQuery("#EtDestinyHtl").val(),
                    dataType: "jsonp", 
                    //---
                    data: request,
                    success: function(data) {
                        cacheDH[request.term] = data.results;
                        response(data.results);
                    }
                });
            },
            select: function(event, ui) {
                //alert(ui.item.Label);
                    jQuery(this).val(ui.item.Label);
                    jQuery("#Etdt").val(ui.item.TypeID);
                    if(ui.item.Type=="H"){ jQuery("#EtHt").val(ui.item.TypeID); jQuery("#formahotel").attr('action','http://www.e-tsw.com.mx/Hoteles/Tarifas'); }
                    else { jQuery("#EtHt").val(""); jQuery("#formahotel").attr('action','http://www.e-tsw.com.mx/Hoteles/Lista'); }
                    jQuery("#EtCt").val(ui.item.Country);
                    return false;
            } 
        });
       
    }
    // Config de form paquetes
    if ($("#formapackage").length === 1) {
        jQuery("#formapackage").submit(function(){ return(ValidateFLPK('formapackage','dn')); });       
        jQuery("#formapackage").submit(function(){ return(restrict45Days('formapackage')); });  
        jQuery("#formapackage").submit(function(){ return(restrictPack8People()); });   
        jQuery("#formapackage .rm select").change(function(){changeRoom('#formapackage','Pk')});
        jQuery("#RoomPk1 select[name=ch1]").change(function(){setAgeC(1,'Pk')});
        jQuery("#AgePk1 select").change(function(){setAgeCI('Pk',1)});
        jQuery("#RoomPk2 select[name=ch2]").change(function(){setAgeC(2,'Pk')});
        jQuery("#AgePk2 select").change(function(){setAgeCI('Pk',2)});
        jQuery("#RoomPk3 select[name=ch3]").change(function(){setAgeC(3,'Pk')});
        jQuery("#AgePk3 select").change(function(){setAgeCI('Pk',3)});
        //autocompletado origen paquetes
        jQuery("#EtCityOrig").autocomplete({
            minLength: 2,
            delay: 1000,
            source: function(request, response) {
                if (request.term in cachePQ) {
                    response(cachePQ[request.term]);
                    return;
                }
                jQuery.ajax({
                    url: "http://partners.clickhotels.com/AJAX/AirportsJSONP?idioma="+IDioMA,
                    dataType: "jsonp",
                    data: request,
                    success: function(data) {
                        cachePQ[request.term] = data;
                        response(data);
                    }
                });
            },
            select: function(event, ui) {
                jQuery("#EtCityOrig").val(ui.item.desc);
                jQuery("#EtIATAob").val(ui.item.id);
                return false;
            }
        }).data("ui-autocomplete")._renderItem = function(ul, item) {
            return jQuery("<li></li>")
                .data("item.autocomplete", item)
                .append(jQuery("<a></a>, ").text(item.desc))
                .appendTo(ul);
        };
        //autocompletado destino paquetes
        jQuery("#EtDestinyPkl").autocomplete({
                minLength: 2,
                delay: 1000,
                source: function(request, response) {
                    if (request.term in cacheD) {
                        response(cacheD[request.term]);
                        return;
                    }
                    jQuery.ajax({
                        // Callback - JSONP
                        url: "http://partners.clickhotels.com/AJAX/DestinationsJSONP?idioma="+IDioMA,
                        dataType: "jsonp",
                        data: request,
                        success: function(data) {
                                cacheD[request.term] = data;
                                response(data);
                        }
                    });
                },
                select: function(event, ui) {
                        jQuery("#EtDestinyPkl").val(ui.item.desc);
                        jQuery("#EtdtPk").val(ui.item.dest_id);
                        return false;
                }
        }).data("ui-autocomplete")._renderItem = function(ul, item) {
                return jQuery("<li></li>")
        .data("item.autocomplete", item)
        .append(jQuery("<a></a>, ").text(item.desc))
        .appendTo(ul);
        };
   
    }
    // Config de form vuelos
    if ($("#formaflight").length === 1) {
        jQuery("#formaflight").submit(function(){   return(ValidateFLPK('formaflight','ni')); });
        jQuery("#EtFType").change(function(){
            if(jQuery(this).val()=="round") { 
                jQuery("#formaflight .EtDateToGN").parent().show(); 
                jQuery("#formaflight .EtDateFromGN").datepick("option", {onDate:RangoDias});
            }
            else { 
                jQuery("#formaflight .EtDateToGN").parent().hide(); 
                jQuery("#formaflight .EtDateFromGN").datepick("option", {onDate:null});
            }
        }); 
        jQuery("#RoomFL1 select[name=ch1]").change(function(){setAgeC(1,'FL')});
        jQuery("#AgeFL1 select").change(function(){setAgeCI('FL',1)});

        //autocompletado origen vuelos
        jQuery("#EtCityOrigFL").autocomplete({
            minLength: 2,
            delay: 1000,
            source: function(request, response) {
                if (request.term in cachePQ) {
                    response(cachePQ[request.term]);
                    return;
                }
                jQuery.ajax({
                    url: "http://partners.clickhotels.com/AJAX/AirportsJSONP?idioma="+IDioMA,
                    dataType: "jsonp",
                    data: request,
                    success: function(data) {
                        cachePQ[request.term] = data;
                        response(data);
                    }
                });
            },
            select: function(event, ui) {
                //alert("selection: " + ui.item.id + " : " + ui.item.desc_name + " : " + ui.item.desc);
                jQuery("#EtCityOrigFL").val(ui.item.desc);
                jQuery("#EtIATAobFl").val(ui.item.id);
                return false;
            }
        }).data("ui-autocomplete")._renderItem = function(ul, item) {
            return jQuery("<li></li>")
                .data("item.autocomplete", item)
                .append(jQuery("<a></a>, ").text(item.desc))
                .appendTo(ul);
        };
        //autocompletado destino vuelos
        jQuery("#EtDestinyFL").autocomplete({
            minLength: 2,
            delay: 1000,
            source: function(request, response) {
                if (request.term in cachePQ) {
                    response(cachePQ[request.term]);
                    return;
                }
                jQuery.ajax({
                    url: "http://partners.clickhotels.com/AJAX/AirportsJSONP?idioma="+IDioMA,
                    dataType: "jsonp",
                    data: request,
                    success: function(data) {
                        cachePQ[request.term] = data;
                        response(data);
                    }
                });
            },
            select: function(event, ui) {
                jQuery("#EtDestinyFL").val(ui.item.desc);
                jQuery("#EtIATAibFl").val(ui.item.id);
                return false;
            }
        }).data("ui-autocomplete")._renderItem = function(ul, item) {
            return jQuery("<li></li>")
                .data("item.autocomplete", item)
                .append(jQuery("<a></a>, ").text(item.desc))
                .appendTo(ul);
        }; 


    } 
    // Config de form autos
    if ($("#formacar").length === 1) { 
        jQuery('#formacar').submit(function(){ return(ValidateHotel('formacar','cityco',MsjDestinO,AltMsjDestinO)); });     
        jQuery('#formacar').submit(function(){ return(restrictCar30Days()); });
        jQuery('#formacar').submit(function(){ return(restrictCar24Hours()); });    
        //autocompletado origen autos
        jQuery("input[name=nu]").autocomplete({
            minLength: 3,
            delay: 0,
            source:  function( request, response ) {
                var resultados=  jLinq.from(arrCars)
                .contains("desc", request.term)
                .select();
                response(resultados);
            }, 
            select: function(event, ui) {
                jQuery("input[name=nu]").val(ui.item.AuxText);
                jQuery("#pu").val(ui.item.ID);
                jQuery("#formacar input[name=no]").val(ui.item.AuxText);
                jQuery("#do").val(ui.item.ID);
                return false;
            }
        }).data("ui-autocomplete")._renderItem = function(ul, item) {
            return jQuery("<li></li>")
                .data("item.autocomplete", item)
                .append(jQuery("<a></a>, ").text(item.AuxText))
                .appendTo(ul);
        };


        
        //autocompletado destino autos
        jQuery("#formacar input[name=no]").autocomplete({
            minLength: 3,
            delay: 0,
            source:  function( request, response ) {
                var resultados=  jLinq.from(arrCars)
                .contains("desc", request.term)
                .select();
                response(resultados);
            }, 
            select: function(event, ui) {
                jQuery("#formacar input[name=no]").val(ui.item.AuxText);
                jQuery("#do").val(ui.item.ID);
                return false;
            }
        }).data("ui-autocomplete")._renderItem = function(ul, item) {
            return jQuery("<li></li>")
                .data("item.autocomplete", item)
                .append(jQuery("<a></a>, ").text(item.AuxText))
                .appendTo(ul);
        };  
        //Calendarios
        jQuery("#formacar .EtDateFromGN").datepicker("option", {minDate:1});
        jQuery("#formacar .EtDateToGN").datepicker("option", {minDate:+2});
    }
    // Config de form tours
    if ($("#formatour").length === 1) {  
        jQuery('#formatour').submit(function(){ return(ValidateDate('formatour')); });
        //Calendarios
        jQuery("#formatour .EtDateFromGN").datepicker("option", {beforeShowDay:null}); //,onDate:null
    }
    // Config de form traslados
    if ($("#formatransfer").length === 1) { 
        jQuery('#formatransfer').submit(function(){ return(ValidateHotel('formatransfer','EtHotel',FalseHotel,MsjHotel)); });
        jQuery("#EtTypeId").change(function(){
            if(jQuery(this).val()=="R"){ 
                jQuery("#formatransfer .EtDateToGN").parent().show();
                jQuery("#formatransfer .EtDateFromGN").parent().show();
                jQuery("#formatransfer .EtDateFromGN,#formatransfer .EtDateToGN ").datepicker("option", {beforeShowDay:RangoDias});
            }
            if(jQuery(this).val()=="L"){ 
                jQuery("#formatransfer .EtDateToGN").parent().hide();
                jQuery("#formatransfer .EtDateFromGN").parent().show();
                jQuery("#formatransfer .EtDateFromGN,#formatransfer .EtDateToGN ").datepicker("option", {beforeShowDay:null});
            }
            if(jQuery(this).val()=="S"){ 
                jQuery("#formatransfer .EtDateToGN").parent().show();
                jQuery("#formatransfer .EtDateFromGN").parent().hide();
                jQuery("#formatransfer .EtDateFromGN,#formatransfer .EtDateToGN ").datepicker("option", {beforeShowDay:null});
            }       
        });         
        //autocompletado traslado
        jQuery("#EtHotel").autocomplete({
            minLength: 2,
            delay: 1000,
            source: function(request, response) {
                if (request.term in cacheT) {
                    response(cacheT[request.term]);
                    return;
                }
                jQuery.ajax({
                    url: "http://www.bestday.com.mx/searchservices/getSearchJson.aspx?Lenguaje="+IDioMA+"&ItemTypes=H:10&Filters=S|1&PalabraBuscada="+jQuery("#EtHotel").val(),
                    dataType: "jsonp",
                    /* data: request, */
                    success: function(data) {
                        cacheT[request.term] = data.results;
                        response(data.results);
                    }
                });
            },
            select: function(event, ui) {
                jQuery("#EtHotel").val(ui.item.Label);
                jQuery("#EtHotelId").val(ui.item.TypeID);
                jQuery("#EtCountryId").val(ui.item.Country);
                return false;
            }
        }).data("ui-autocomplete")._renderItem = function(ul, item) {
            return jQuery("<li></li>")
                .data("item.autocomplete", item)
                .append(jQuery("<a></a>, ").text(item.Label))
                .appendTo(ul);
        };      
        jQuery("#EtTypeId").change(function(){
            jQuery("#EtType").val(jQuery(this).children("option:selected").html());
            
        }).change();
        //Calendarios
        jQuery("#formatransfer .EtDateFromGN").datepicker("option", {minDate:2});
        jQuery("#formatransfer .EtDateToGN").datepicker("option", {minDate:3});
    }

});

/*VARIABLES*/
var MsjAirport,altMsjAirport,altMsjAirportr,altMsjDate,NFOrigen,NFDestino,PosadaAllIclusive,FalseHotel,FormatO,MsjAllInclusive,MsjHotel,Msj45Days,MsjMinTimeCar,MsjMaxTimeCar,IDioMA,MsjDestinO = {},inicionoches=0,noches=0;
var cachePQ = {};
var cacheDH = {};
var cacheD = {};
var cacheT = {};

/*Funciones para los calendarios*/
function DefVar(obj)
{
    if(jQuery(obj+" input[name=ln]").val().toUpperCase()=="ESP")
    {
        MsjDestinO="Especifique una ciudad";
        AltMsjDestinO="Por favor especifique una ciudad";
        MsjAirport="Escriba el nombre de la ciudad";
        altMsjAirport="Por favor seleccione un aeropuerto de origen.";
        altMsjAirportr="Por favor seleccione un aeropuerto de llegada.";
        altMsjDate="Debe Seleccionar una";
        NFOrigen="Por favor seleccione un aeropuerto de origen.";
        NFDestino="Por favor seleccione un aeropuerto de destino."
        PosadaAllIclusive="Puede seleccionar como m\u00E1ximo 4 personas por habitaci\u00F3n.";
        FormatO="dd/mm/yy";
        MsjAllInclusive="M\u00E1ximo 4 personas por habitaci\u00F3n, incluyendo ni\u00F1os.";
        FalseHotel="Nombre del hotel";
        MsjHotel="Especifique un hotel por favor.";
        Msj45Days="No se pueden reservar m\u00E1s de 45 d\u00edas.";
        MsjMinTimeCar="La fecha y hora de devoluci\u00F3n no puede ser menor a 24 horas a partir de la fecha de reservaci\u00F3n.";
        MsjMaxTimeCar="La fecha y hora de devoluci\u00F3n no puede ser mayor a 30 días a partir de la fecha de reservaci\u00F3n.";
        MsjMaxPeoplePack="El n\u00famero m\u00e1ximo permitido por reservaci\u00f3n es de 8 personas, por favor corrija e intente nuevamente su b\u00fasqueda";
        IDioMA="esp";
    }
    if(jQuery(obj+" input[name=ln]").val().toUpperCase()=="POR")
    {
        MsjDestinO="Introduza uma cidade";
        AltMsjDestinO="Por favor introduza uma cidade";
        MsjAirport="Cidade ou Aeroporto";
        altMsjAirport="Por favor seleccione um aeroporto de partida.";
        altMsjAirportr="Por favor seleccione um aeroporto de chegada.";
        altMsjDate="Vocꡤeve selecionar uma data";
        NFOrigen="Digite o aeroporto de partida.";
        NFDestino="Especificar Retorno aeroporto";
        PosadaAllIclusive="Voc\u00EA deve selecionar at\u00E9 quatro pessoas por quarto.";
        FormatO="dd/mm/yy";
        MsjAllInclusive="M\u00E1ximo de 4 pessoas por quarto, incluindo crian\u00E7as.";
        FalseHotel="Por favor, seleccione um hotel";
        MsjHotel="Please select a hotel.";
        Msj45Days="Voc\u00ea n\u00e3o pode reservar mais de 45 dias";
        MsjMinTimeCar="A data e hora de retorno n\u00e3o pode ser inferior a 24 horas ap\u00F3s a data da reserva.";
        MsjMaxTimeCar="A data e hora de retorno n\u00e3o pode ser superior a 30 dias ap\u00F3s a data da reserva.";
        MsjMaxPeoplePack="O n\u00famero m\u00e1ximo permitido por reserva \u00e9 de 8 pessoas, por favor, corrija e tente novamente a sua pesquisa";
        IDioMA="por";
    }
    if(jQuery(obj+" input[name=ln]").val().toUpperCase()=="ING")
    {
        MsjDestinO="Enter a city";
        AltMsjDestinO="Please enter a city";
        MsjAirport="Enter the name of the city";
        altMsjAirport="Please enter the name of the city.";
        altMsjAirportr="Please select an arrival airport.";
        altMsjDate="Please select a date";
        NFOrigen="Enter the departure airport.";
        NFDestino="Specify airport Return";
        PosadaAllIclusive="You must select up to four people per room.";
        FormatO="mm/dd/yy";
        MsjAllInclusive="Maximum 4 persons per room, including children.";
        FalseHotel="Hotel name";
        MsjHotel="Please enter a hotel name";
        Msj45Days="You can not book more than 45 days";
        MsjMinTimeCar="The date and time of return can not be less than 24 hours after the reservation date.";
        MsjMaxTimeCar="The date and time of return can not be greater than 30 days from the reservation date.";
        MsjMaxPeoplePack="The maximum number allowed per reservation is 8 people, please correct and try your search again";
        IDioMA="ing";
    }
}

function  _normaliseDate (date) {
    if (date) {
        date.setHours(12, 0, 0, 0);
    }
    return date;
}
// Funcion para sumar Fechas
function addDate (date, amount, period) {
    if (period == 'd' || period == 'w') {
        this._normaliseDate(date);
        date.setDate(date.getDate() + amount * (period == 'w' ? 7 : 1));
    }
    else {
        var year = date.getFullYear() + (period == 'y' ? amount : 0);
        var month = date.getMonth() + (period == 'm' ? amount : 0);
        date.setTime(plugin.newDate(year, month + 1,
            Math.min(date.getDate(), this.daysInMonth(year, month + 1))).getTime());
    }
    return date;
}

function DefaultDate(){

    //Fechas Default en Calendarios
    var defaultDate = new Date();       // Obtiene la fecha 
    defaultDate = addDate(defaultDate,'+7', 'd');       // Le suma 7 días
    jQuery(".EtDateFromGN").datepicker( "setDate",defaultDate);
    defaultDate = addDate(defaultDate,'+2', 'd');      // Le suma 2 día
    jQuery(".EtDateToGN").datepicker( "setDate",defaultDate);    
}

//Suma o resta fechas segun al calendario que se le da click
function OnSelectDate(dateSel) {
    var formId=jQuery(this).parents("form").attr('id');
    var dtClass=jQuery(this).attr('class');
    var dateFromInput=jQuery("#"+formId+" .EtDateFromGN");
    var dateToInput=jQuery("#"+formId+" .EtDateToGN");
    var newdate,dateFrom,dateTo;
     //ESTA SECCIÓN IDENTIFICA A QUE CALENDARIO SE LE DA CLICK
    if ( dtClass.indexOf('EtDateFromGN') >=0 ){
        dateFrom = jQuery(this).datepicker("getDate");
        dateTo = dateToInput.datepicker("getDate");  
        newdate=addDate(dateFrom,'+2', 'd'); //Nueva fecha para el input EtDateToGN
        if (dateFrom>=dateTo) {dateToInput.datepicker("setDate",newdate);} // Asignamos el nuevo valor al input EtDateToGN
    }
    else{
        dateFrom = dateFromInput.datepicker("getDate");
        dateTo = jQuery(this).datepicker("getDate");
        newdate=addDate(dateTo,'-2', 'd'); //Nueva fecha para el input EtDateFromGN
        if (dateTo<=dateFrom) {dateFromInput.datepicker("setDate",newdate); } // Asignamos el nuevo valor al input EtDateFromGN
       // NumeroNoches(dateFrom.getTime(), dateTo.getTime() );
    }
}

// Asigna clases para el  sombreado del inicio y fin de una reservacion
function RangoDias(date) {
    var clase="";
    var titulo="";
    var forma=jQuery(this).parents("form").attr('id');
    var inicio= jQuery('#'+forma+' .EtDateFromGN').datepicker("getDate");
    var fin= jQuery('#'+forma+' .EtDateToGN').datepicker("getDate"); 
    //Se convierte todo a milisegundos
    date=date.getTime();
    inicio=inicio.getTime();
    if(fin==null){fin=0; }
    else{fin=fin.getTime();}
    //Se agregan las clases para la reservacion
    if(date>inicio && date<fin) {clase="selectedDay";titulo="Día de estancia"; }
    else if(date ==inicio) {clase="selectedFrom";titulo="Día de ida"; }
    else if(date==fin){clase="selectedTo";titulo="Día de regreso";}
    return [true, clase, titulo]
}
//Muestra numero de noches de las fechas seleccionadas
function NumeroNoches(date){
    jQuery(".Noches").remove();
    
    var Formanoches=jQuery(this).parents("form").attr('id'),
        //inicio= jQuery('#'+Formanoches+' .EtDateFromGN').datepicker("getDate").getTime(),
        fin= jQuery('#'+Formanoches+' .EtDateToGN').datepicker("getDate").getTime();
        inicionoches= jQuery('#'+Formanoches+' .EtDateFromGN').datepicker("getDate").getTime();

        noches=(fin-inicionoches)/864e5;
    jQuery(".ui-datepicker-current").after("<span class='Noches' >"+noches+" Noches</span>");        
}
//Muestra numero de noches al pocisionar el mouse sobre un dia
function NumeroNochesHover(){
   var datehover=$(this).parent().data(),//Se obtiene mes y año del dia seleccionado
        diahover=parseInt( $(this).html());
    var fechahover= new Date ( datehover.year,datehover.month, diahover );
        fechahover=fechahover.getTime();
    fechahover=Math.round((fechahover-inicionoches)/864e5);

    if(fechahover>0){
        $(".Noches").text(fechahover+" Noches");    
    }else{
        jQuery(".Noches").text(noches+" Noches");  
    }   
}

/*Termina Calendarios*/

/*Funciones Generales */

//Autos
var arrCars=[
    {desc:'Acapulco',AuxText:'Acapulco Aeropuerto',ID:'2,ACA,111|'},
    {desc:'Acapulco',AuxText:'Acapulco Centro',ID:'2,ACA,112|'},
    {desc:'Cancun',AuxText:'Cancún Aeropuerto',ID:'2,CUN,139|'},
    {desc:'Cancun',AuxText:'Cancún Centro de Convenciones',ID:'2,CUN,147|'},
    {desc:'Cancun',AuxText:'Cancún Plaza La Isla',ID:'2,CUN,146|'},
    {desc:'Cancun',AuxText:'Cancún Walmart',ID:'2,CUN,143|'},
    {desc:'Cozumel',AuxText:'Cozumel Aeropuerto',ID:'2,COZ,134|'},
    {desc:'Huatulco',AuxText:'Huatulco Aeropuerto',ID:'2,HUAT,154|'},
    {desc:'Ixtapa - Zihuatanejo',AuxText:'Ixtapa-Zihuatanejo Aeropuerto',ID:'3,IXTA,634|'},
    {desc:'Los Cabos',AuxText:'Los Cabos Aeropuerto',ID:'2,SJC,190|'},
    {desc:'Mazatlan',AuxText:'Mazatlán Aeropuerto',ID:'3,MAZCER,603|'},
    {desc:'Merida',AuxText:'Mérida Aeropuerto',ID:'2,MERID,163|'},
    {desc:'Merida',AuxText:'Mérida Fiesta Americana',ID:'2,MERID,165|'},
    {desc:'Ciudad de Mexico',AuxText:'Cd. de México Aeropuerto',ID:'2,AIRPORT,115|'},
    {desc:'Ciudad de Mexico',AuxText:'Cd. de México Camino Real',ID:'2,AIRPORT,118|'},
    {desc:'Ciudad de Mexico',AuxText:'Cd. de México Patriotismo',ID:'2,AIRPORT,121|'},
    {desc:'Ciudad de Mexico',AuxText:'Cd. de México Vallejo',ID:'2,AIRPORT,119|'},
    {desc:'Ciudad de Mexico',AuxText:'Cd. de México Walmart Acoxpa',ID:'2,AIRPORT,122|'},
    {desc:'Ciudad de Mexico',AuxText:'Cd. de México Walmart Miguel ágel Quevedo',ID:'2,AIRPORT,124|'},
    {desc:'Ciudad de Mexico',AuxText:'Cd. de México Walmart Santa Fé',ID:'2,AIRPORT,120|'},
    {desc:'Ciudad de Mexico',AuxText:'Cd. de México Walmart Satelite',ID:'2,AIRPORT,123|'},
    {desc:'Puerto Vallarta',AuxText:'Puerto Vallarta Aeropuerto',ID:'2,PTRN,181|'},
    {desc:'Riviera Maya|Tulum',AuxText:' Tulum Centro',ID:'2,TULUM,198|'},
    {desc:'Riviera Maya|Tulum',AuxText:' Tulum Hotel Copal',ID:'2,TULUM,199|'},
    {desc:'Guadalajara',AuxText:'Guadalajara Aeropuerto',ID:'2,GUAD,150|'},
    {desc:'Guadalajara',AuxText:'Guadalajara Camino Real',ID:'2,GUAD,151|'},
    {desc:'Playa del Carmen',AuxText:'Playa del Carmen Centro',ID:'2,PDC,175|'},
    {desc:'Playa del Carmen',AuxText:'Playa del Carmen Quinta Avenida',ID:'2,PDC,177|'},
    {desc:'Oaxaca',AuxText:'Oaxaca Aeropuerto',ID:'3,OAX,606|'},
    {desc:'Veracruz',AuxText:'Veracruz Aeropuerto',ID:'2,VER,202|'},
    {desc:'Veracruz',AuxText:'Coatzacoalco-Minatitlán Coatzacoalcos-Minatitlan Aeropuerto',ID:'2,COAT,132|'},
    {desc:'Monterrey',AuxText:'Monterrey Aeropuerto',ID:'2,MTYAIR,168|'},
    {desc:'Monterrey',AuxText:'Monterrey Sheraton Amnassador',ID:'2,MTYAIR,171|'},
    {desc:'Monterrey',AuxText:'Monterrey Camino Real',ID:'2,MTYAIR,169|'},
    {desc:'La Paz',AuxText:'La Paz Aeropuerto',ID:'2,LAPAZ,708|'},
    {desc:'La Paz',AuxText:'La Paz Walmart',ID:'2,LAPAZ,159|'},
    {desc:'La Paz',AuxText:'La Paz Santa Cruz de la Sierra',ID:'4,BOlapaz,770|'},
    {desc:'Puebla',AuxText:'Puebla Centro',ID:'2,PUEB,186|'},
    {desc:'Queretaro',AuxText:'Queretaro Aeropuerto',ID:'2,QRO,187|'},
    {desc:'Queretaro',AuxText:'Queretaro Centro',ID:'2,QRO,188|'},
    {desc:'Villahermosa',AuxText:'Villahermosa Aeropuerto',ID:'2,VILLA,204|'},
    {desc:'Toluca',AuxText:'Toluca Aeropuerto',ID:'2,TOL,197|'},
    {desc:'Chihuahua',AuxText:'Chihuahua Aeropuerto',ID:'2,CHI,130|'},
    {desc:'Chihuahua',AuxText:'Chihuahua Centro',ID:'2,CHI,131|'},
    {desc:'Aguascalientes',AuxText:'Aguascalientes Aeropuerto',ID:'2,AGUA,113|'},
    {desc:'Aguascalientes',AuxText:'Aguascalientes Centro',ID:'2,AGUA,114|'},
    {desc:'Tijuana',AuxText:'Tijuana Aeropuerto Advantage',ID:'2,TIJ,195|'},
    {desc:'Tijuana',AuxText:'Tijuana Centro',ID:'2,TIJ,196|'},
    {desc:'Ciudad Juarez',AuxText:'Cd. Juárez Aeropuerto',ID:'2,CDJ,128|'},
    {desc:'Ciudad Juarez',AuxText:'Cd. Juárez Centro',ID:'2,CDJ,129|'},
    {desc:'Leon',AuxText:'León Aeropuerto',ID:'2,LEO,160|'},
    {desc:'San Luis Potosi',AuxText:'San Luis Potosí Aeropuerto',ID:'2,SLP,192|'},
    {desc:'San Luis Potosi',AuxText:'San Luis Potosí Holiday Inn Quijote',ID:'2,SLP,193|'},
    {desc:'Mexicali',AuxText:'Mexicali Aeropuerto',ID:'2,MEXICALI,166|'},
    {desc:'Mexicali',AuxText:'Mexicali Centro',ID:'2,MEXICALI,167|'},
    {desc:'Saltillo',AuxText:'Saltillo Aeropuerto',ID:'2,SAL,709|'},
    {desc:'Tuxtla Gutierrez',AuxText:'Tuxtla Gutiérrez Aeropuerto',ID:'2,TUX,200|'},
    {desc:'Tuxtla Gutierrez',AuxText:'Tuxtla Gutiérrez Camino Real',ID:'2,TUX,201|'},
    {desc:'Culiacan',AuxText:'Culiacán Aeropuerto Advantage',ID:'2,CULI,646|'}
];
//Configura las secciones del autocompletado
jQuery.widget( "custom.catcomplete", jQuery.ui.autocomplete, {
    _renderMenu: function( ul, items ) {
        var self = this,
            currentCategory = "";
        $.each( items, function( index, item ) {
            var encabezado="";
            if(item.Type=="D"){encabezado='<img src="http://www.e-tsw.com.mx/_lib/kvista/img/general/destinos_bg_'+IDioMA+'.png" alt="Destinos"/>';}
            else{ encabezado='<img src="http://www.e-tsw.com.mx/_lib/kvista/img/general/hoteles_bg_'+IDioMA+'.png" alt="Hoteles"/>';}
            if ( item.Type != currentCategory ) {
                ul.append( "<li class='ui-autocomplete-category'>" + encabezado + "</li>" );
                currentCategory = item.Type;
            }
            self._renderItemData(ul,item);
            
        });
    },
    _renderItem: function (ul,item){
        return jQuery("<li></li>")
        .data("item.autocomplete", item)
        .append(jQuery("<a></a>, ").text(item.Label))
        .appendTo(ul);
    }
}); 

//Función de cambio de pestaña
function CambiaPestanas(objeto,clase,contenedores){
    jQuery(objeto).click(function(){
        jQuery(objeto).removeClass(clase);
        jQuery(this).addClass(clase);
        jQuery(contenedores).hide();
        var contenedor = jQuery(contenedores+":nth-child("+(jQuery(this).index()+1)+")");
        contenedor.show();
        /* Inicia Fix Bug IE  */
        contenedor.attr("class", contenedor.attr("class"));
        /* Termina Fix Bug IE */        
    });
}
function ResetAll(){
    //Origen Destino
    $("#EtDestinyHtl, #cityco, #cityib").val(MsjDestinO);
    $("#EtCityOrig, #EtDestinyPkl, #EtCityOrigFL, #EtDestinyFL").val(MsjAirport);
    $("#EtHotel").val(FalseHotel);

    //Cuartos
    $("select[name='rm']").val(1).change();
    //Adultos
    $("select[name='ad1']").val(2).change();
    //Niños
    $("select[name='ch1']").val(0).change();
    //Formulario
    $("input[name='ct'],input[name='ds'],input[name='ht'],input[name='ob'],input[name='ib'],input[name='do'],input[name='pu'],input[name=ht],input[name=ctf],input[name=ac1],input[name=ac2],input[name=ac3]").val('');
}
//Modificar el foco
function changeFocus(obj,text)
{
    jQuery(obj).focus(function(){
        if(jQuery(this).val()==text)
        {
            jQuery(this).val("");
        }
        jQuery(this).blur(function(){
            if(jQuery(this).val()=="")
            {
                jQuery(this).val(text);
            }
        }); 
    });
}
//reinicia edad de los niños
function restarAge(cuarto,suf)
{
    jQuery("#Room"+suf+cuarto+' select[name=ch'+cuarto+']').val(0).change();
    jQuery("#Age"+suf+cuarto).hide();
    jQuery("#Age"+suf+cuarto+' .age-select select').val(0).change();
    jQuery("#Et"+suf+"NumAges"+cuarto).val("");
    if  (!(
            ( jQuery("#Room"+suf+'1 select[name=ch1]').length!=0&&jQuery("#Room"+suf+'1 select[name=ch1]').val()!=0 ) ||
            ( jQuery("#Room"+suf+'2 select[name=ch2]').length!=0&&jQuery("#Room"+suf+'2 select[name=ch2]').val()!=0 ) ||
            ( jQuery("#Room"+suf+'3 select[name=ch3]').length!=0&&jQuery("#Room"+suf+'3 select[name=ch3]').val()!=0 ) 
        ))
    {
        jQuery("#Age"+suf+"C").hide();
    }
}
//Reinicia configuración de cuartos
function restartRoom(forma,cuarto,suf)
{
    jQuery("#Room"+suf+cuarto).hide();
    restarAge(cuarto,suf);
}
//muestra cuartos
function showRoom(forma,cuarto,suf)
{
    jQuery("#Room"+suf+cuarto).show();
}
//Funcion cambio cuartos
function changeRoom(forma,suf){
    if(jQuery(forma+ ' .rm select').val()==1)
    {
        showRoom(forma,1,suf);
        restartRoom(forma,2,suf);
        restartRoom(forma,3,suf);
    }
    if(jQuery(forma+ ' .rm select').val()==2)
    {
        showRoom(forma,1,suf);
        showRoom(forma,2,suf);
        restartRoom(forma,3,suf);
    }
    if(jQuery(forma+ ' .rm select').val()==3)
    {
        showRoom(forma,1,suf);
        showRoom(forma,2,suf);
        showRoom(forma,3,suf);
    }
}
//funcion asigna edad ninos
function setAgeC(cuarto,suf)
{
    if  (
            ( jQuery("#Room"+suf+'1 select[name=ch1]').length!=0&&jQuery("#Room"+suf+'1 select[name=ch1]').val()!=0 ) ||
            ( jQuery("#Room"+suf+'2 select[name=ch2]').length!=0&&jQuery("#Room"+suf+'2 select[name=ch2]').val()!=0 ) ||
            ( jQuery("#Room"+suf+'3 select[name=ch3]').length!=0&&jQuery("#Room"+suf+'3 select[name=ch3]').val()!=0 ) 
        ) 
    {
        jQuery("#Age"+suf+"C").show();
    } 
    else 
    {
        jQuery("#Age"+suf+"C").hide();
    }
    jQuery("#Age"+suf+cuarto).show();
    if(jQuery("#Room"+suf+cuarto+' select[name=ch'+cuarto+']').val()==0)
    {
        jQuery("#Age"+suf+cuarto).hide();
        jQuery("#Et"+suf+"NumAges"+cuarto).val('');
    }
    if(jQuery("#Room"+suf+cuarto+' select[name=ch'+cuarto+']').val()==1)
    {
        jQuery("#Age"+suf+cuarto+' .age-select').hide();
        jQuery("#Age"+suf+cuarto+' .age-select select').val(0).change();
        jQuery("#Age"+suf+cuarto+' .ones').show();
        jQuery("#Et"+suf+"NumAges"+cuarto).val('0');
    }
    if(jQuery("#Room"+suf+cuarto+' select[name=ch'+cuarto+']').val()==2)
    {
        jQuery("#Age"+suf+cuarto+' .age-select').val(0).hide();
        jQuery("#Age"+suf+cuarto+' .age-select select').val(0).change();
        jQuery("#Age"+suf+cuarto+' .ones').show();
        jQuery("#Age"+suf+cuarto+' .two').show();
        jQuery("#Et"+suf+"NumAges"+cuarto).val('0,0');
    }
    if(jQuery("#Room"+suf+cuarto+' select[name=ch'+cuarto+']').val()==3)
    {
        jQuery("#Age"+suf+cuarto+' .age-select').val(0).hide();
        jQuery("#Age"+suf+cuarto+' .age-select select').val(0).change();
        jQuery("#Age"+suf+cuarto+' .ones').show();
        jQuery("#Age"+suf+cuarto+' .two').show();
        jQuery("#Age"+suf+cuarto+' .three').show();
        jQuery("#Et"+suf+"NumAges"+cuarto).val('0,0,0');
    }
}
function setAgeCI(suf,cuarto)
{
    if(jQuery("#Room"+suf+cuarto+' select[name=ch'+cuarto+']').val()==1)
    {
        jQuery("#Et"+suf+"NumAges"+cuarto).val( jQuery('#Age'+suf+cuarto+' .ones select').val() );
    }
    if(jQuery("#Room"+suf+cuarto+' select[name=ch'+cuarto+']').val()==2)
    {
        jQuery("#Et"+suf+"NumAges"+cuarto).val(jQuery('#Age'+suf+cuarto+' .ones select').val()+','+jQuery('#Age'+suf+cuarto+' .two select').val());
    }
    if(jQuery("#Room"+suf+cuarto+' select[name=ch'+cuarto+']').val()==3)
    {
        jQuery("#Et"+suf+"NumAges"+cuarto).val(jQuery('#Age'+suf+cuarto+' .ones select').val()+','+jQuery('#Age'+suf+cuarto+' .two select').val()+','+jQuery('#Age'+suf+cuarto+' .three select').val());
    }
}
//Validar Fechas
function restrict45Days(forma) {
    var dateFrom = $.datepick.parseDate(FormatO, $('#'+forma+' .EtDateFromGN').val());
    var dateTo = $.datepick.parseDate(FormatO, $('#'+forma+' .EtDateToGN').val());

    var daysDiff = parseInt((dateTo.getTime()-dateFrom.getTime())/(24*3600*1000));
    
    if( daysDiff > 44 )
    {
        alert(Msj45Days);
        return(false);
    }           
}
function restrictCar30Days() {
    var dateFrom = $.datepick.parseDate(FormatO, $('#formacar .EtDateFromGN').val());
    var dateTo = $.datepick.parseDate(FormatO, $('#formacar .EtDateToGN').val());

    var daysDiff = parseInt((dateTo.getTime()-dateFrom.getTime())/(24*3600*1000));
    
    if( daysDiff > 30 )
    {
        alert(MsjMaxTimeCar);
        return(false);
    }           
}   
function restrictCar24Hours() {
    var dateFrom = $.datepick.parseDate(FormatO, $('#formacar .EtDateFromGN').val());
    var dateTo = $.datepick.parseDate(FormatO, $('#formacar .EtDateToGN').val());
    var horaEntrega = $("#Hora_Entrega").val().split(':')[0];
    var horaDevolucion = $("#Hora_Devolucion").val().split(':')[0];
    dateFrom.setHours(horaEntrega);
    dateTo.setHours(horaDevolucion);

    var hoursDiff = parseInt((dateTo.getTime()-dateFrom.getTime())/(3600*1000));
    
    if( hoursDiff < 24 )
    {
        alert(MsjMinTimeCar);
        return(false);
    }
}
function restrictPack8People() {
    var rooms = parseInt($("#formapackage .rm select").val());
    var ad1 = parseInt($("#formapackage select[name=ad1]").val());
    var ad2 = parseInt($("#formapackage select[name=ad2]").val());
    var ad3 = parseInt($("#formapackage select[name=ad3]").val());
    var ch1 = parseInt($("#formapackage select[name=ch1]").val());
    var ch2 = parseInt($("#formapackage select[name=ch2]").val());
    var ch3 = parseInt($("#formapackage select[name=ch3]").val());
    var sum = ad1 + ch1;
    if ( rooms > 1 ) {sum += ad2 + ch2}
    if ( rooms > 2 ) {sum += ad3 + ch3}
    if ( sum > 8 )  {
        alert(MsjMaxPeoplePack);
        return false;
    }
}
//Validar vuelos y paquetes
function ValidateFLPK(forma,objdestino){
    if(jQuery("#"+forma+ " input[name=no]").val()==""||jQuery("#"+forma+ " input[name=no]").val()==MsjAirport)
    {
        alert(altMsjAirport);
        return(false);
    }
    if(jQuery("#"+forma+ " input[name="+objdestino+"]").val()==""||jQuery("#"+forma+ " input[name="+objdestino+"]").val()==MsjAirport)
    {
        alert(altMsjAirportr);
        return(false);
    }
    if(ValidateDate(forma)==false){ return(false); }
}
//Valida hotel
function ValidateHotel(forma,objdest,msjobjdest,altmsjobjdest){
    if(jQuery('#'+objdest).val()==''||jQuery('#'+objdest).val()==msjobjdest)
    {
        alert(altmsjobjdest);
        return(false);
    }
    if(ValidateDate(forma)==false){ return(false); }
}