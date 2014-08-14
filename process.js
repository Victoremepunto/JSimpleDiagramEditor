/**
 * process.js Process class 
 */

var Process = function(data)
{
    this.nodes; 
    this.first; 
    this.zones;
    this.nextId;

    this.init(data);
};

$.extend(Process.prototype,
{
    init: function(data)
    {
        this.nodes = {}; 
        this.nextId = 0;
        this.zones = { 'down': 0, 'right':1, 'center':2 };

        if (typeof(data) != 'undefined')
        {
            if (typeof(data.nodes) != 'undefined')
                this.nodes = data.nodes;
            if (typeof(data.first) != 'undefined')
                this.first = data.first;
        }

        return this;
    },

    //createNode: function(id)
    createNode: function(id,type,name)
    {
        var n = new Node({'id': this.getNextId(), 'type':type});
        //n.setData('type',$('#'+id).attr('data-type'));
        n.setData('id',id);
        n.setData('name',name);
        n.setData('type',type);
        return n;
    },

    getFirst: function()
    {
        return this.first;
    },

    setFirst: function(node)
    {
        this.first = node;
        return this;
    },

    /**
     * Remove node which id's is id.
     * It will remove the corresponding node fixing the links
     * of the previous and next nodes accordingly
     *
     * It will NOT remove the node if it has more than 1 next 
     * node.
     */
    removeNodes: function(id)
    {
        node = this.getNode(id);

        /*
        if ((typeof(node) != 'undefined') && (node.getTotalNextNodes() < 2))
        {
            previousNode = node.getPrevious();
            nextNode = node.getFirstNext();
            
            if (typeof(previousNode) != 'undefined') 
            previousNode.getNext()[$.inArray(node,previousNode.getNext())] = nextNode;

            if (typeof(nextNode) != 'undefined')
                nextNode.setPrevious(node.getPrevious());
            
            if (this.getFirst().getId() == id)
                this.setFirst(nextNode);
   
            delete this.nodes[id];
        }
            else
                return -1;
        return this;    
        */

        try
        {
            if ((typeof(node) == 'undefined') || (node.getTotalNextNodes() >= 2))
                throw "Can't remove node!";
            else{

                if (node.getRelPosition() == 'inside')
                    delete node.getPrevious().getData()['nodes'][id];
                else
                {
        
                    previousNode = node.getPrevious();
                    nextNode = node.getFirstNext();
                
                    if (typeof(previousNode) != 'undefined') 
                        previousNode.getNext()[$.inArray(node,previousNode.getNext())] = nextNode;
    
                    if (typeof(nextNode) != 'undefined')
                        nextNode.setPrevious(node.getPrevious());
                
                    if (this.getFirst().getId() == id)
                        this.setFirst(nextNode);
                }
                
   
                delete this.nodes[id];
            }
        } catch(err)
        {
            alert(err);
        }
        return this;
    },

    getNodes: function()
    {
        return this.nodes;
    },

    getNode: function(id)
    {
        return this.nodes[id];
    },

/*
    insertNode: function(id,type,name,nodeId,where)
    {
        try{

            if (typeof(id) == 'undefined')
                throw 'Id cannot be empty';

            if (typeof(type) == 'undefined')
                throw 'Type cannot be empty';

            if (typeof(name) == 'undefined')
                throw 'Name cannot be empty';
        }
        catch(err) {
            alert(err);
            return this;
        }

        var newNode = this.createNode(id,type,name);
    
        this.insertNode(newNode);
    },
*/
    insertNode: function(newNode,nodeId,where)
    {
        try {
        if (typeof(newNode) == 'undefined')
            throw 'You must provide a valid Node';
        } catch(err) {
            alert(err);
            return this;
        }

        if (where == 'center')
        {
/*
            containerNode = this.getNode(nodeId);
            containerNode.getData('nodes')[newNode.getId()] = newNode;
            newNode.setPrevious(containerNode);
*/
            this.getNode(nodeId).addNode(newNode);
//            containerNode.AddNode(newNode);
        }
        else
        {
            index=this.getWhereIndex(where);

            previousNode = this.getNode(nodeId);

            nextNode = previousNode ?
                previousNode.getNext()[index] :
                this.getFirst();
    
            //if going to be the first...
            if ((typeof(previousNode) == 'undefined') || 
                (Object.keys(this.nodes).length == 0))
                this.setFirst(newNode);
            else
                previousNode.addNext(newNode,index);
    
            newNode.addNext(nextNode,index);
            newNode.setPrevious(previousNode);
            
            if (typeof(nextNode) != 'undefined')
                nextNode.setPrevious(newNode);
        //    this.nodes[newNode.id] = newNode;
        }
        this.nodes[newNode.id] = newNode;

        return this;
    },

    getNextId:  function()
    {
        return this.nextId++;
    },

/*
    toString: function()
    {
        var process= 'Process:\n';
            $.each(this.nodes,function(k,v)
                {
                    process += v;
                })
        return process;
    },
*/

    getWhereIndex: function(where)
    {
        return this.zones[where] || 0;
    },

});
