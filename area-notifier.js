/**
 * Area Notifier
 *
 * Definición de Objeto Javascript para detectar areas próximas a
 * un elemento HTML.
 */

var Area = function(data)
{
    this.currentMousePos = { top: -1, left: -1 };
    this.element = {};
    this.up = {};
    this.down = {};
    this.left = {};
    this.right = {};
    this.wide = 0;
    this.zones = [];
    this.name = '';
    this.invaded = {};
    this.active_zones = ['down','right']; // up, down, left, right, center.
    this.valid_zones = ['center','up','down','left','right'];
    this.debug = false;
    //this.debug = true;

    this.init(data);

};
    
$.extend(Area.prototype,
{
    init: function(data)
    {
        try{
            if (typeof(data) == 'undefined')
                throw 'Missing mandatory parameters';
            else
            {
                this.recordMousePos();

                if (typeof(data.element) == 'undefined')
                {
                    this.wide = typeof(data.wide) !== 'undefined' ? parseInt(data.wide) : 0;
                    this.name = data.name; 
                    this.active_zones = [];
                }
            
                else
                {

                    this.element = data.element;
                    this.name = 'center';
                    this.wide = typeof(data.wide) !== 'undefined' ? parseInt(data.wide) : 0;
            
                    if (typeof(data.areas) !== 'undefined')
                        this.active_zones = data.areas;
            
                    this.zones.push(this);
            
                    if (this.wide > 0)
                        this.defineAreas();
                    else
                        this.active_zones = [];

                    this.checkAreas();
                }

                if (typeof(data.debug) == 'boolean')
                    this.debug = data.debug;
            }
        } catch(err) {
            console.log('AREA-'+ err);
        }
    },

    getCurrentMousePos: function()
    {
        return this.currentMousePos;
    },

    getElement: function()
    {
        return this.element;
    },

    setElement: function(element)
    {
        this.element = element;
        return this;
    },

    getPosition: function()
    {
        var position = this.getElement().offset();
        var width = parseInt(this.getElement().outerWidth());
        var height = parseInt(this.getElement().outerHeight());

        switch(this.getName())
        {
            case 'right': position.left += width ; break;
            case 'down' : position.top += height ; break;
            case 'left' : position.left -= this.wide ; break;
            case 'up':    position.top -= this.wide ; break;
            default : break;
        }

        return position;
    },
    getWidth: function()
    {
        var w = parseInt(this.getElement().outerWidth());
        switch(this.getName())
        {
            case 'left' : 
            case 'right': w = this.getWide() ; break;
            default : break;
        }
        return w;
    },

    getHeight: function()
    {
        var h = parseInt(this.getElement().outerHeight());
        switch(this.getName())
        {
            case 'up' : 
            case 'down': h = this.getWide() ; break;
            default : break;
        }
        return h;
    },

    getArea: function(a)
    {
        var area = undefined;
        switch(a)
        {
            case 'up'    : area = this.up; break;
            case 'down'  : area = this.down; break;
            case 'left'  : area = this.left; break;
            case 'right' : area = this.right; break;
        }
        return area;
    },

    getWide: function()
    {
        return this.wide;
    },
    
    setWide: function(w)
    {
        this.wide = w;
//        this.resetAreas();
        return this;
    },

    getInvaded: function()
    {
        return ($.isEmptyObject(this.invaded)) ? '' : this.invaded.getName() ;
    },

    getAreaInvaded: function()
    {
        return this.invaded;
    },

    getName: function()
    {
        return this.name;
    },

    recordMousePos: function()
    {
        $(document).on('mousemove',{cmp:this.currentMousePos},function(event)
        {
            event.data.cmp.left = event.pageX;
            event.data.cmp.top = event.pageY;
        });
    },

    checkAreaByName: function(name)
    {
        switch(name){
            case 'up': return inArea(this.up); break;
            case 'down': return inArea(this.down); break;
            case 'left': return inArea(this.left); break;
            case 'right': return inArea(this.right); break;
            case 'center': return inArea(this); break;
            default : return false; 
        }
    },

    inArea: function(area)
    {

        a = parseInt(this.currentMousePos.left);
        b = parseInt(this.currentMousePos.top);

        return (
/*
            (a > area.position.left ) &&
            (a < area.position.left+area.width) &&
            (b > area.position.top ) &&
            (b < area.position.top+area.height)
*/
            (a > area.getPosition().left ) &&
            (a < area.getPosition().left+area.getWidth()) &&
            (b > area.getPosition().top ) &&
            (b < area.getPosition().top+area.getHeight())
        ); 
    },

    checkAreas: function()
    {
        $(document).on('mousemove',{area:this},function(event)
        {
            a = parseInt(event.data.area.currentMousePos.left);
            b = parseInt(event.data.area.currentMousePos.top);

            if ( $.isEmptyObject(event.data.area.invaded)) 
            {
                for (i = 0; i<event.data.area.zones.length; i++)
                {
                    var z = event.data.area.zones[i]; 

                    if ($.inArray(z.name,event.data.area.active_zones) == -1)
                        continue;

                    if (event.data.area.inArea(z))
                    {
                        event.data.area.invaded = z;
                        //$(document).trigger('areaInvaded', [event.data.area]);
                        $(event.data.area.element).trigger('areaInvaded', [event.data.area]);
                        event.data.area.say('event triggered: areaInvaded');
                        event.data.area.say(event.data.area);
                        break;
                    }
                }
            }
            else
            {
                if (! event.data.area.inArea(event.data.area.invaded))
                {
                    event.data.area.invaded = {};
                    //event.data.area.checkAreas();
                    //$(document).trigger('areaReleased', [event.data.area]);
                    $(event.data.area.element).trigger('areaReleased', [event.data.area]);
                    event.data.area.say('event triggered: areaReleased');
                    event.data.area.say(event.data.area);
                }
            }
        });
    },

    defineAreas: function()
    {
        this.defineUpArea();
        this.defineDownArea();
        this.defineLeftArea();
        this.defineRightArea();

        this.zones.push(this.up);
        this.zones.push(this.down);
        this.zones.push(this.left);
        this.zones.push(this.right);
    },

/*
    resetAreas: function()
    {
        //this.element.off();
        this.say('reseting areas');

        this.zones = [];
        this.position=
        {
            left: parseInt(this.element.position().left),
            top: parseInt(this.element.position().top)
        };

        this.width = parseInt(this.element.outerWidth());
        this.height = parseInt(this.element.outerHeight());

        this.zones.push(this);

        if (this.wide > 0)
            this.defineAreas();
        else
            this.active_zones = [];

        this.checkAreas();
    },
    */

    listenMovement: function()
    {
        //this.element.on
    },

    enableZone: function(z)
    {
        this.say('enabling zone:'+z);

        if ($.inArray(z,this.valid_zones) > -1)
            if ($.inArray(z,this.active_zones == -1))
                this.active_zones.push(z);
    },

    disableZone: function(z)
    {
        this.say('disabling zone:'+z);

        pos = $.inArray(z,this.active_zones);
        if (pos != -1)
            if ($.inArray(z,this.valid_zones) > -1)
                this.active_zones.splice(pos,1);
    },

    defineCenterArea: function()
    {
        this.center = new Area(
        {
            position: 
            {
                top: this.element.position().top,
                left: this.element.position().left,
            },
            width: this.width,
            height: this.wide,
            name: 'center'
        });
    },

    defineUpArea: function()
    {
        this.up = new Area(
        {
/*
            position: 
            {
                top: this.element.position().top - this.wide,
                left: this.element.position().left
            },
            width: this.width,
            height: this.wide,
*/
            name: 'up'
        });
        this.up.setElement(this.getElement());
        this.up.setWide(this.getWide());

        this.say('Up area defined: '+this.up);
    },

    defineDownArea: function()
    {
        this.down = new Area(
        {
/*
            position:
            {
                top: this.element.position().top + this.height,
                left: this.element.position().left
            },
            width: this.width,
            height: this.wide,
*/
            name:'down'
        });

        this.down.setElement(this.getElement());
        this.down.setWide(this.getWide());

        this.say('Down area defined');
        this.say(this.down);
    },

    defineLeftArea: function()
    {
        this.left = new Area(
        {
/*
            position:
            {
                top: this.element.position().top,
                left: this.element.position().left - this.wide
            },
            width: this.wide,
            height: this.height,
*/
            name: 'left'
        });
        this.left.setElement(this.getElement());
        this.left.setWide(this.getWide());

        this.say('Left area defined');
        this.say(this.left);

    },

    defineRightArea: function()
    {
        this.right = new Area(
        {
/*
            position:
            { 
                top: this.element.position().top,
                left: this.element.position().left + this.width
            },
            width: this.wide,
            height: this.height,
*/
            name: 'right'
        });
        this.right.setElement(this.getElement());
        this.right.setWide(this.getWide());

        this.say('Right area defined');
        this.say(this.right);
    },

    say: function(msg)
    {
        if (this.debug)
            if (typeof(msg) == 'string')
                console.log('AREA-DBG: '+msg);
            else
                console.log('AREA-DBG:') && console.log(msg);
    },

});
