const {GraphQLObjectType , GraphQLID , GraphQLString,GraphQLList, GraphQLSchema} = require('graphql')

// mongoose models
const Project = require('../models/Project')
const Client = require('../models/Client')

//Client Type

const ClientType =new GraphQLObjectType({
    name : 'client',
    fields : () =>({
        id : {type : GraphQLID},
        name:{type : GraphQLString},
        email:{type : GraphQLString},  
        phone : {type : GraphQLString},
        projects : {
            type : GraphQLList(ProjectType),
            resolve(parent, args) {
                return Project.find({ ClientId: parent.id })
            }
        } 
    }) 
})

//Project type
const ProjectType = new GraphQLObjectType({
    name:'project',
    fields:()=>({
        id : {type : GraphQLID},
        name:{type : GraphQLString},
        description:{type : GraphQLString},  
        status : {type : GraphQLString},
        clients:{
            type:ClientType,
            resolve(parent,args){
                return Client.findById(parent.clientId)
            }
        }
    })
})

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields :{
        clients: {
            type: new GraphQLList(ClientType),
            resolve() {
                return Client.find();
            }
        },
        client : {
            type : ClientType,
            args:{id : {type : GraphQLID}},
            resolve(parent , args){
                return Client.findById(args.id)
            }
        },
        projects:{
            type : new GraphQLList(ProjectType),
            resolve(){
                return Project.find()
            }
        },
        project:{
            type:ProjectType,
            args :{id : {type : GraphQLID}},
            resolve(parent , args){
                return Project.findById(args.id)
            }
        }
        
    }
})

module.exports = new GraphQLSchema({
    query : RootQuery  
})