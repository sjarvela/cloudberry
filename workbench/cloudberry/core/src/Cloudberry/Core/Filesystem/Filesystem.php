<?php

namespace Cloudberry\Core\Filesystem;

use \FSC;

interface Filesystem {
	const DIRECTORY_SEPARATOR = "/";

	public function getId();

	public function createItem($itemId);

	public function getChildren($folder);
}

interface FilesystemItem {

	function getId();

	function getParentId();

	function getRootId();

	function getName();

	function getPath();

	function isFile();
}

interface FilesystemFile extends FilesystemItem {
	function getSize();
}

interface FilesystemFolder extends FilesystemItem {

	function isRoot();

	function getChildren();

}

abstract class AbstractFilesystemItem extends \Eloquent implements FilesystemItem {
	protected $hidden = array('fs', 'item_id');

	public function __construct($fs, $itemId, $parentId, $rootId, $path, $name) {
		$this->attributes = array("id" => $itemId->id, "item_id" => $itemId, "parent_id" => $parentId, "root_id" => $rootId, "name" => $name, "path" => $path, "fs" => $fs, "is_file" => $this->isFile());
	}

	public function getFS() {
		return $this->fs;
	}

	public function getItemId() {
		return $this->item_id;
	}

	public function getId() {
		return $this->id;
	}

	public function getParentId() {
		return $this->parent_id;
	}

	public function getParent() {
		if ($this->parent_id == NULL) {
			return NULL;
		}

		return FSC::getItem($this->parent_id);
	}

	public function getRootId() {
		return $this->root_id;
	}

	public function getRoot() {
		return FSC::getItem($this->root_id);
	}

	public function getName() {
		return $this->name;
	}

	public function getPath() {
		return $this->path;
	}

	public function getLastModified() {
		return FSC::getItemLastModified($this);
	}

	abstract function isFile();
}

class File extends AbstractFilesystemItem implements FilesystemFile {
	public function isFile() {
		return TRUE;
	}

	public function getSize() {
		return FSC::getFileSize($this);
	}
}

class Folder extends AbstractFilesystemItem implements FilesystemFolder {
	public function __construct($fs, $itemId, $parentId, $rootId, $path, $name) {
		parent::__construct($fs, $itemId, $parentId, $rootId, $path, $name);
		$this->attributes["is_root"] = $this->isRoot();
	}

	public function isRoot() {
		return $this->path == Filesystem::DIRECTORY_SEPARATOR;
	}

	public function getChildren() {
		return FSC::getChildren($this);
	}

	public function isFile() {
		return FALSE;
	}
}