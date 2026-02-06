module.exports = (sequelize, DataTypes) => {
    const ChatKnowledgeBase = sequelize.define('ChatKnowledgeBase', {
        title: { type: DataTypes.STRING, allowNull: false },
        content_type: DataTypes.STRING,
        admission_year: DataTypes.INTEGER,
        major: DataTypes.STRING,
        keywords: DataTypes.STRING,
        source: DataTypes.STRING,
        content: DataTypes.TEXT, 
        vector_id: DataTypes.STRING, 
        status: { 
            type: DataTypes.ENUM('active', 'draft', 'archived'), 
            defaultValue: 'active' 
        }
    }, {
        tableName: 'chat_knowledge_base',
        timestamps: true, 
        underscored: true 
    });

    return ChatKnowledgeBase;
};