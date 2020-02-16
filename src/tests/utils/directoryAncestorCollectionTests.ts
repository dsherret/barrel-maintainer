import { expect } from "chai";
import { Project, Directory } from "ts-morph";
import { DirectoryAncestorCollection } from "./../../utils";

describe("DirectoryAncestorCollection", () => {
    const project = new Project({ useInMemoryFileSystem: true });
    const rootDir = project.createDirectory("dir");
    const child1 = rootDir.createDirectory("child1");
    const child2 = rootDir.createDirectory("child2");
    const grandChild1 = child1.createDirectory("grandChild1");

    function testDirs(collection: DirectoryAncestorCollection, dirs: Directory[]) {
        expect(collection.getAll().map(d => d.getPath()).sort()).to.deep.equal(
            dirs.map(d => d.getPath()).sort()
        );
    }

    describe("#tryAdd()", () => {
        it("should add if no descendant or ancestor exists", () => {
            const collection = new DirectoryAncestorCollection();
            collection.tryAdd(child1);
            collection.tryAdd(child2);
            testDirs(collection, [child1, child2]);
        });

        it("should not add if an ancestor exists", () => {
            const collection = new DirectoryAncestorCollection();
            collection.tryAdd(rootDir);
            collection.tryAdd(child1);
            collection.tryAdd(child2);
            testDirs(collection, [rootDir]);
        });

        it("should not add if the same directory exists", () => {
            const collection = new DirectoryAncestorCollection();
            collection.tryAdd(rootDir);
            collection.tryAdd(rootDir);
            testDirs(collection, [rootDir]);
        });

        it("should add if a descendant exists and remove the descendants", () => {
            const collection = new DirectoryAncestorCollection();
            collection.tryAdd(grandChild1);
            collection.tryAdd(child1);
            testDirs(collection, [child1]);
            collection.tryAdd(child2);
            collection.tryAdd(rootDir);
            testDirs(collection, [rootDir]);
        });
    });

    describe("#clear()", () => {
        it("should clear anything that exists in the collection", () => {
            const collection = new DirectoryAncestorCollection();
            collection.tryAdd(child1);
            collection.tryAdd(child2);
            collection.clear();
            expect(collection.getAll().length).to.equal(0);
        });
    });
});
