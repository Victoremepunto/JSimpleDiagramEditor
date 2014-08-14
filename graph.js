var node = function(data)
{
    this.id;
    this.info;
    this.left;
    this.right;
};

/*
var binaryTree = function(data)
{
    this.root={}; // NODE;
};
*/

var graph = function()
{
    this.nodes = {};
};

$.extend(graph.prototype,
{
    addNode: function(node)
    {
        this.nodes{node.id} = node;
    },

    getNode: function(info)
    {
        return this.nodes{info};
    },

        
};
