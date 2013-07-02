
describe("ContentService", function () {

    var mockDiscoveryService,
        mockConnectionManager,
        mockCallback,
        contentService,

        rootId = '/api/ezp/v2/',
        testContentObjects = '/api/ezp/v2/content/objects',
        testContentId = '/api/ezp/v2/content/objects/173',
        testRemoteId = '30847bec12a8a398777493a4bdb10398',
        testVersionedContentId = '/api/ezp/v2/content/objects/173/version/1',
        testVersionsList = '/api/ezp/v2/content/objects/173/versions',
        testLocation = '/api/ezp/v2/content/locations/1/2/102',
        testRelation = '/api/ezp/v2/content/objects/102/versions/5/relations/1',
        testUrlAlias = '/api/ezp/v2/content/urlaliases/0-a903c03b86eb2987889afa5fe17004eb',
        testUrlWildcard = '/api/ezp/v2/content/urlwildcards/1',
        testObjectStateGroup = '/api/ezp/v2/content/objectstategroups/1',
        testObjectState = '/api/ezp/v2/content/objectstategroups/7/objectstates/5',
        testTrashItem = '/api/ezp/v2/content/trash/1',
        testSection = '/api/ezp/v2/content/sections/1',

        fakedLoadContentInfo = function(contentId, callback){
            var mockContentResponse = {};
            mockContentResponse.body = JSON.stringify({
                "Content" : {
                    "Versions" : {
                        "_href" : testVersionsList,
                        "_media-type" : "application/vnd.ez.api.VersionList+json"
                    },
                    "CurrentVersion" : {
                        "_href" : testVersionedContentId,
                        "_media-type" : "application/vnd.ez.api.Version+json"
                    }
                }
            });
            callback(false, mockContentResponse);
        };

    describe("is calling injected objects with right arguments while performing:", function () {

        beforeEach(function (){
            mockConnectionManager = jasmine.createSpyObj('mockConnectionManager', ['request', 'delete']);
            mockCallback = jasmine.createSpy('mockCallback');

            mockDiscoveryService = {
                getInfoObject : function(name, callback){

                    if (name === "content"){
                        callback(
                            false,
                            {
                                "_href" : testContentObjects,
                                "_media-type" : ""
                            }
                        )
                    }

                }
            }

            spyOn(mockDiscoveryService, 'getInfoObject').andCallThrough();

            contentService = new ContentService(mockConnectionManager, mockDiscoveryService);
        });

        it("loadRoot", function () {

            contentService.loadRoot(
                rootId,
                mockCallback
            );

            expect(mockConnectionManager.request).toHaveBeenCalled();
            expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
            expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(rootId); //url
            expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
            expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.Root+json"); // headers
            expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback

        });

        // *********
        // Content
        describe("Content management request:", function () {

            it("createContent", function () {

                var locationCreateStruct = contentService.newLocationCreateStruct("/api/ezp/v2/content/locations/1/2/118"),
                    contentCreateStruct = contentService.newContentCreateStruct(
                        "/api/ezp/v2/content/types/18",
                        locationCreateStruct,
                        "eng-US",
                        "DummyUser"
                    ),
                    fieldInfo = {
                        "fieldDefinitionIdentifier": "title",
                        "languageCode": "eng-US",
                        "fieldValue": "This is a title"
                    };

                contentCreateStruct.body.ContentCreate.fields.field.push(fieldInfo);

                mockDiscoveryService.getInfoObject("content",function(){});

                contentService.createContent(
                    contentCreateStruct,
                    mockCallback
                );

                expect(mockDiscoveryService.getInfoObject).toHaveBeenCalledWith("content", jasmine.any(Function));

                expect(mockConnectionManager.request).toHaveBeenCalled();
                expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("POST"); //method
                expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testContentObjects); //url
                expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(JSON.stringify(contentCreateStruct.body)); // body
                expect(mockConnectionManager.request.mostRecentCall.args[3]).toEqual(contentCreateStruct.headers); // headers
                expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
            });

            it("updateContentMetadata", function () {

                var updateStruct = contentService.newContentMetadataUpdateStruct(
                    "eng-US"
                );

                updateStruct.body.ContentUpdate.Section = "/api/ezp/v2/content/sections/2";
                updateStruct.body.ContentUpdate.remoteId = "random-id-" + Math.random()*1000000;

                contentService.updateContentMetadata(
                    testContentId,
                    updateStruct,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalled();
                expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("PATCH"); //method
                expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testContentId); //url
                expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(JSON.stringify(updateStruct.body)); // body
                expect(mockConnectionManager.request.mostRecentCall.args[3]).toEqual(updateStruct.headers); // headers
                expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
            });

            it("loadContentInfo", function () {
                contentService.loadContentInfo(
                    testContentId,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalled();
                expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testContentId); //url
                expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.ContentInfo+json"); // headers
                expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
            });

            it("loadContentInfoAndCurrentVersion", function () {
                contentService.loadContentInfoAndCurrentVersion(
                    testContentId,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalled();
                expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testContentId); //url
                expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.Content+json"); // headers
                expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
            });

            it("deleteContent", function () {
                contentService.deleteContent(
                    testContentId,
                    mockCallback
                );

                expect(mockConnectionManager.delete).toHaveBeenCalled();
                expect(mockConnectionManager.delete.mostRecentCall.args[0]).toEqual(testContentId); //url
                expect(mockConnectionManager.delete.mostRecentCall.args[1]).toBe(mockCallback); // callback
            });

            it("copyContent", function () {
                contentService.copyContent(
                    testContentId,
                    testLocation,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalled();
                expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("COPY"); //method
                expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testContentId); //url
                expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                expect(mockConnectionManager.request.mostRecentCall.args[3].Destination).toEqual(testLocation); // headers
                expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
            });

            it("loadContentByRemoteId", function () {
                contentService.loadContentByRemoteId(
                    testRemoteId,
                    mockCallback
                );

                expect(mockDiscoveryService.getInfoObject).toHaveBeenCalledWith("content", jasmine.any(Function));

                expect(mockConnectionManager.request).toHaveBeenCalled();
                expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testContentObjects + "?remoteId=" + testRemoteId); //url
                expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual(""); // headers
                expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
            });

        });

        // *********
        // Versions
        describe("Versions management request:", function () {

            it("loadCurrentVersion", function () {

                spyOn(contentService, 'loadContentInfo').andCallFake(fakedLoadContentInfo);

                contentService.loadCurrentVersion(
                    testContentId,
                    mockCallback
                );

                expect(contentService.loadContentInfo).toHaveBeenCalledWith(testContentId, jasmine.any(Function));

                expect(mockConnectionManager.request).toHaveBeenCalled();
                expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testVersionedContentId); //url
                expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.Version+json"); // headers
                expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
            });

            it("loadVersions", function () {

                spyOn(contentService, 'loadContentInfo').andCallFake(fakedLoadContentInfo);

                contentService.loadVersions(
                    testContentId,
                    mockCallback
                );

                expect(contentService.loadContentInfo).toHaveBeenCalledWith(testContentId, jasmine.any(Function));

                expect(mockConnectionManager.request).toHaveBeenCalled();
                expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testVersionsList); //url
                expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.VersionList+json"); // headers
                expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
            });

            it("loadContent", function () {

                contentService.loadContent(
                    testVersionedContentId,
                    "",
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalled();
                expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("GET"); //method
                expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testVersionedContentId); //url
                expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.Version+json"); // headers
                expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
            });

            it("updateContent", function () {

                var contentUpdateStruct = contentService.newContentUpdateStruct(
                    "eng-US",
                    "DummyUser"
                );

                var fieldInfo = {
                    "fieldDefinitionIdentifier": "title",
                    "languageCode": "eng-US",
                    "fieldValue": "This is a new title" + Math.random()*1000000
                };

                contentUpdateStruct.body.VersionUpdate.fields.field.push(fieldInfo);

                contentService.updateContent(
                    testVersionedContentId,
                    contentUpdateStruct,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalled();
                expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("PATCH"); //method
                expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testVersionedContentId); //url
                expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(JSON.stringify(contentUpdateStruct.body)); // body
                expect(mockConnectionManager.request.mostRecentCall.args[3]).toEqual(contentUpdateStruct.headers); // headers
                expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback

            });

            it("createContentDraft from current version", function () {

                spyOn(contentService, 'loadContentInfo').andCallFake(fakedLoadContentInfo);

                contentService.createContentDraft(
                    testContentId,
                    null,
                    mockCallback
                );

                expect(contentService.loadContentInfo).toHaveBeenCalledWith(testContentId, jasmine.any(Function));

                expect(mockConnectionManager.request).toHaveBeenCalled();
                expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("COPY"); //method
                expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testVersionedContentId); //url
                expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.Version+json"); // headers
                expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
            });

            it("createContentDraft from specified version", function () {

                spyOn(contentService, 'loadContentInfo').andCallFake(fakedLoadContentInfo);

                contentService.createContentDraft(
                    testContentId,
                    1,
                    mockCallback
                );

                expect(contentService.loadContentInfo).toHaveBeenCalledWith(testContentId, jasmine.any(Function));

                expect(mockConnectionManager.request).toHaveBeenCalled();
                expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("COPY"); //method
                expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testVersionsList + "/" + 1); //url
                expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                expect(mockConnectionManager.request.mostRecentCall.args[3].Accept).toEqual("application/vnd.ez.api.Version+json"); // headers
                expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
            });

            it("deleteVersion", function () {

                contentService.deleteVersion(
                    testVersionedContentId,
                    mockCallback
                );

                expect(mockConnectionManager.delete).toHaveBeenCalled();
                expect(mockConnectionManager.delete.mostRecentCall.args[0]).toEqual(testVersionedContentId); //url
                expect(mockConnectionManager.delete.mostRecentCall.args[1]).toBe(mockCallback); // callback
            });

            it("publishVersion", function () {

                contentService.publishVersion(
                    testVersionedContentId,
                    mockCallback
                );

                expect(mockConnectionManager.request).toHaveBeenCalled();
                expect(mockConnectionManager.request.mostRecentCall.args[0]).toEqual("PUBLISH"); //method
                expect(mockConnectionManager.request.mostRecentCall.args[1]).toEqual(testVersionedContentId); //url
                expect(mockConnectionManager.request.mostRecentCall.args[2]).toEqual(""); // body
                expect(mockConnectionManager.request.mostRecentCall.args[3]).toEqual({}); // headers
                expect(mockConnectionManager.request.mostRecentCall.args[4]).toBe(mockCallback); // callback
            });

        });
//
//        // Relations
//        describe("Relations management request:", function () {
//
//            it("loadCurrentRelations", function () {
//                contentService.loadCurrentRelations(
//                    testContentId,
//                    0,
//                    -1,
//                    function(){}
//                );
//                expect(fakeConnection.execute).toHaveBeenCalled();
//            });
//
//            it("loadRelations", function () {
//                contentService.loadRelations(
//                    testVersionedContentId,
//                    0,
//                    -1,
//                    function(){}
//                );
//                expect(fakeConnection.execute).toHaveBeenCalled();
//            });
//
//            it("loadRelation", function () {
//                contentService.loadRelation(
//                    testRelation,
//                    function(){}
//                );
//                expect(fakeConnection.execute).toHaveBeenCalled();
//            });
//
//            it("createRelation", function () {
//                var relationCreateStruct = contentService.newRelationCreateStruct("/api/ezp/v2/content/objects/132");
//
//                contentService.addRelation(
//                    testVersionedContentId,
//                    relationCreateStruct,
//                    function(){}
//                );
//                expect(fakeConnection.execute).toHaveBeenCalled();
//            });
//
//            //TODO: In real life, take as an argument relation which was created during createRelation test
//            it("deleteRelation", function () {
//                contentService.deleteRelation(
//                    testRelation,
//                    function(){}
//                );
//                expect(fakeConnection.execute).toHaveBeenCalled();
//            });
//
//        });
//
//        // Locations
//        describe("Locations management request:", function () {
//
//            it("createLocation", function () {
//                var locationCreateStruct = contentService.newLocationCreateStruct(
//                    "/api/ezp/v2/content/locations/1/2/113"
//                );
//
//                contentService.createLocation(
//                    testContentId + '/locations',
//                    locationCreateStruct,
//                    function(){}
//                );
//                expect(fakeConnection.execute).toHaveBeenCalled();
//            });
//
//            it("updateLocation", function () {
//                var locationUpdateStruct = contentService.newLocationUpdateStruct();
//                locationUpdateStruct.remoteId = "random-remote-id-" + Math.random()*100000;
//
//                contentService.updateLocation(
//                    testLocation,
//                    locationUpdateStruct,
//                    function(){}
//                );
//                expect(fakeConnection.execute).toHaveBeenCalled();
//            });
//
//            it("loadLocations", function () {
//                contentService.loadLocations(
//                    testContentId + '/locations',
//                    function(){}
//                );
//                expect(fakeConnection.execute).toHaveBeenCalled();
//            });
//
//            it("loadLocationChildren", function () {
//                contentService.loadLocationChildren(
//                    testContentId,
//                    0,
//                    -1,
//                    function(){}
//                );
//                expect(fakeConnection.execute).toHaveBeenCalled();
//            });
//
//            it("loadLocationByRemoteId", function () {
//                contentService.loadLocationByRemoteId(
//                    "/api/ezp/v2/content/locations",
//                    "0bae96bd419e141ff3200ccbf2822e4f",
//                    function(){}
//                );
//                expect(fakeConnection.execute).toHaveBeenCalled();
//            });
//
//            it("copySubtree", function () {
//                contentService.copySubtree(
//                    "/api/ezp/v2/content/locations/1/2/113",
//                    testLocation,
//                    function(){}
//                );
//                expect(fakeConnection.execute).toHaveBeenCalled();
//            });
//
//            it("moveSubtree", function () {
//                contentService.moveSubtree(
//                    "/api/ezp/v2/content/locations/1/2/119",
//                    testLocation,
//                    function(){}
//                );
//                expect(fakeConnection.execute).toHaveBeenCalled();
//            });
//
//            it("swapLocation", function () {
//                contentService.swapLocation(
//                    "/api/ezp/v2/content/locations/1/2/113",
//                    testLocation,
//                    function(){}
//                );
//                expect(fakeConnection.execute).toHaveBeenCalled();
//            });
//
//            //TODO: In real life, take as an argument location which was created during createLocation test
//            it("deleteLocation", function () {
//                contentService.deleteLocation(
//                    testLocation,
//                    function(){}
//                );
//                expect(fakeConnection.execute).toHaveBeenCalled();
//            });
//
//        });
//
//        // Sections
//        describe("Sections management request:", function () {
//
//            it("createSection", function () {
//                var sectionInput = {
//                    SectionInput : {
//                        identifier : "testSection" + Math.random()*1000000,
//                        name : "Test Section"
//                    }
//                };
//                contentService.createSection(
//                    '/api/ezp/v2/content/sections',
//                    JSON.stringify(sectionInput),
//                    function(){}
//                );
//                expect(fakeConnection.execute).toHaveBeenCalled();
//            });
//
//            it("updateSection", function () {
//                sectionInput = {
//                    SectionInput : {
//                        identifier : "testSection" + Math.random()*1000000,
//                        name : "Test Section " + Math.round(Math.random()*1000)
//                    }
//                };
//                contentService.updateSection(
//                    testSection,
//                    JSON.stringify(sectionInput),
//                    function(){}
//                );
//                expect(fakeConnection.execute).toHaveBeenCalled();
//            });
//
//
//            it("loadSection", function () {
//                contentService.loadSection(
//                    testSection,
//                    function(){}
//                );
//                expect(fakeConnection.execute).toHaveBeenCalled();
//            });
//
//            it("loadSections", function () {
//                contentService.loadSections(
//                    function(){}
//                );
//                expect(fakeConnection.execute).toHaveBeenCalled();
//            });
//
//            //TODO: Take value created during previous tests
//            it("deleteSection", function () {
//                contentService.deleteSection(
//                    testSection,
//                    function(){}
//                );
//                expect(fakeConnection.execute).toHaveBeenCalled();
//            });
//
//        });
//
//        // Trash
//        describe("Trash management request:", function () {
//
//            it("loadTrashItems", function () {
//                contentService.loadThrashItems(
//                    0,
//                    -1,
//                    function(){}
//                );
//                expect(fakeConnection.execute).toHaveBeenCalled();
//            });
//
//            it("loadTrashItem", function () {
//                contentService.loadThrashItem(
//                    testTrashItem,
//                    function(){}
//                );
//                expect(fakeConnection.execute).toHaveBeenCalled();
//            });
//
//            it("recoverTrashItem", function () {
//                contentService.recover(
//                    testTrashItem,
//                    "/api/ezp/v2/content/locations/1/2/118",
//                    function(){}
//                );
//                expect(fakeConnection.execute).toHaveBeenCalled();
//            });
//
//            it("deleteTrashItem", function () {
//                contentService.deleteTrashItem(
//                    testTrashItem,
//                    function(){}
//                );
//                expect(fakeConnection.execute).toHaveBeenCalled();
//            });
//
//            it("emptyTrash", function () {
//                contentService.emptyThrash(
//                    function(){}
//                );
//                expect(fakeConnection.execute).toHaveBeenCalled();
//            });
//
//        });
//
//        // Content State Groups
//        describe("Content State groups management request:", function () {
//
//            it("createObjectStateGroup", function () {
//                var objectStateGroupCreateStruct = contentService.newObjectStateGroupCreateStruct(
//                    "some-id" + Math.random(10000),
//                    "eng-US",
//                    [
//                        {
//                            "_languageCode":"eng-US",
//                            "#text":"Some Name " + Math.random(10000)
//                        }
//                    ]
//                );
//
//                contentService.createObjectStateGroup(
//                    "/api/ezp/v2/content/objectstategroups",
//                    objectStateGroupCreateStruct,
//                    function(){}
//                );
//                expect(fakeConnection.execute).toHaveBeenCalled();
//            });
//
//
//            it("updateObjectStateGroup", function () {
//                var objectStateGroupUpdateStruct = contentService.newObjectStateGroupUpdateStruct();
//
//                objectStateGroupUpdateStruct.body.ObjectStateGroupUpdate.identifier = "some-id" + Math.random(10000);
//
//                contentService.updateObjectStateGroup(
//                    testObjectStateGroup,
//                    objectStateGroupUpdateStruct,
//                    function(){}
//                );
//                expect(fakeConnection.execute).toHaveBeenCalled();
//            });
//
//            it("loadObjectStateGroups", function () {
//                contentService.loadObjectStateGroups(
//                    "/api/ezp/v2/content/objectstategroups",
//                    function(){}
//                );
//                expect(fakeConnection.execute).toHaveBeenCalled();
//            });
//
//            it("loadObjectStateGroup", function () {
//                contentService.loadObjectStateGroup(
//                    testObjectStateGroup,
//                    function(){}
//                );
//                expect(fakeConnection.execute).toHaveBeenCalled();
//            });
//
//            //TODO: Take value created during previous tests
//            it("deleteObjectStateGroup", function () {
//                contentService.deleteObjectStateGroup(
//                    testObjectStateGroup,
//                    function(){}
//                );
//                expect(fakeConnection.execute).toHaveBeenCalled();
//            });
//
//        });
//
//        // Content States
//        describe("Content States management request:", function () {
//
//            it("createObjectState", function () {
//                createObjectStateStruct = contentService.newObjectStateCreateStruct(
//                    "some-id" + Math.random(10000),
//                    "eng-US",
//                    0,
//                    [
//                        {
//                            "_languageCode":"eng-US",
//                            "#text":"Some Name " + Math.random(10000)
//                        }
//                    ],
//                    []
//                );
//
//                contentService.createObjectState(
//                    testObjectStateGroup,
//                    createObjectStateStruct,
//                    function(){}
//                );
//                expect(fakeConnection.execute).toHaveBeenCalled();
//            });
//
//            it("updateObjectState", function () {
//                var objectStateUpdateStruct = contentService.newObjectStateUpdateStruct();
//
//                objectStateUpdateStruct.body.ObjectStateUpdate.identifier = "some-id" + Math.random(10000);
//
//                contentService.updateObjectState(
//                    testObjectState,
//                    objectStateUpdateStruct,
//                    function(){}
//                );
//                expect(fakeConnection.execute).toHaveBeenCalled();
//            });
//
//            it("loadObjectState", function () {
//                contentService.loadObjectState(
//                    testObjectState,
//                    function(){}
//                );
//                expect(fakeConnection.execute).toHaveBeenCalled();
//            });
//
//            //TODO: Take value created during previous tests
//            it("deleteObjectState", function () {
//                contentService.deleteObjectState(
//                    testObjectState,
//                    function(){}
//                );
//                expect(fakeConnection.execute).toHaveBeenCalled();
//            });
//
//            it("getContentState", function () {
//                contentService.getContentState(
//                    testContentId + '/objectstates',
//                    function(){}
//                );
//                expect(fakeConnection.execute).toHaveBeenCalled();
//            });
//
//            it("setContentState", function () {
//                var objectStates = {};
//
//                contentService.setContentState(
//                    testContentId + '/objectstates',
//                    objectStates,
//                    function(){}
//                );
//                expect(fakeConnection.execute).toHaveBeenCalled();
//            });
//
//        });
//
//        // URL Alias
//        describe("URL Aliases management request:", function () {
//
//            it("createUrlAlias", function () {
//                var urlAliasCreateStruct = contentService.newUrlAliasCreateStruct(
//                    "eng-US",
//                    "content/search",
//                    "findme-alias"
//                );
//
//                contentService.createUrlAlias(
//                    "/api/ezp/v2/content/urlaliases",
//                    urlAliasCreateStruct,
//                    function(){}
//                );
//                expect(fakeConnection.execute).toHaveBeenCalled();
//            });
//
//            it("listGlobalAliases", function () {
//                contentService.listGlobalAliases(
//                    "/api/ezp/v2/content/urlaliases",
//                    function(){}
//                );
//                expect(fakeConnection.execute).toHaveBeenCalled();
//            });
//
//            it("listLocatonAliases", function () {
//                contentService.listLocationAliases(
//                    testLocation,
//                    false,
//                    function(){}
//                );
//                expect(fakeConnection.execute).toHaveBeenCalled();
//            });
//
//            it("loadUrlAlias", function () {
//                contentService.loadUrlAlias(
//                    testUrlAlias,
//                    function(){}
//                );
//                expect(fakeConnection.execute).toHaveBeenCalled();
//            });
//
//            it("deleteUrlAlias", function () {
//                contentService.deleteUrlAlias(
//                    testUrlAlias,
//                    function(){}
//                );
//                expect(fakeConnection.execute).toHaveBeenCalled();
//            });
//
//        });
//
//        // URL Wildcards
//        describe("URL Wildcards management request:", function () {
//
//            it("createUrlWildCard", function () {
//                var urlWildcardCreateStruct = contentService.newUrlWildcardCreateStruct(
//                        "some-new-wildcard-" + Math.random(100) * 1000,
//                        "testLocation",
//                        "false"
//                    );
//                contentService.createUrlWildcard(
//                    "/api/ezp/v2/content/urlwildcards",
//                    urlWildcardCreateStruct,
//                    function(){}
//                );
//                expect(fakeConnection.execute).toHaveBeenCalled();
//            });
//
//            it("loadUrlWildcards", function () {
//                contentService.loadUrlWildcards(
//                    "/api/ezp/v2/content/urlwildcards",
//                    function(){}
//                );
//                expect(fakeConnection.execute).toHaveBeenCalled();
//            });
//
//            it("loadUrlWildcard", function () {
//                contentService.loadUrlWildcard(
//                    testUrlWildcard,
//                    function(){}
//                );
//                expect(fakeConnection.execute).toHaveBeenCalled();
//            });
//
//            //TODO: Take value created during previous tests
//            it("deleteUrlWildcard", function () {
//                contentService.deleteUrlWildcard(
//                    testUrlWildcard,
//                    function(){}
//                );
//                expect(fakeConnection.execute).toHaveBeenCalled();
//            });
//
//        });

    });

});




